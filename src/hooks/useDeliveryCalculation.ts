import { useState, useEffect } from 'react';

export interface DeliverySettings {
  store_lat: number;
  store_lng: number;
  delivery_fee_base: number;
  delivery_fee_per_km: number;
  delivery_base_radius_km: number;
  delivery_max_radius_km: number;
}

export interface GpsCoords {
  lat: number;
  lon: number;
}

interface DeliveryResult {
  distanceKm: number | null;
  deliveryFee: number | null;
  outOfRange: boolean;
  loading: boolean;
  error: string | null;
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function calcFee(distKm: number, s: DeliverySettings): number {
  if (distKm <= s.delivery_base_radius_km) return s.delivery_fee_base;
  const extra = distKm - s.delivery_base_radius_km;
  return s.delivery_fee_base + extra * s.delivery_fee_per_km;
}

/** Geocode using LocationIQ. Uses structured search and fallback matching to ensure
 *  high success rates for Brazilian addresses and CEPs. */
async function locationiqGeocode(
  street: string,
  city: string,
  state: string,
  cep: string
): Promise<GpsCoords | null> {
  const apiKey = import.meta.env.VITE_LOCATIONIQ_API_KEY || 'pk.e71d875c8c098f20e60c6ac00ef07f8a';
  if (!apiKey) return null;

  const tryQuery = async (params: Record<string, string>): Promise<GpsCoords | null> => {
    try {
      const qParams = new URLSearchParams({
        key: apiKey,
        format: 'json',
        limit: '1',
        countrycodes: 'br',
        ...params
      });
      const res = await fetch(`https://us1.locationiq.com/v1/search?${qParams.toString()}`);
      if (!res.ok) return null;
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
      }
    } catch {
      // network or parse error
    }
    return null;
  };

  // Strategy 1: Postal code + Street (best chance for exact match in LocationIQ)
  if (cep && street) {
    const result = await tryQuery({ postalcode: cep, street });
    if (result) return result;
  }

  // Strategy 2: Just Postal Code
  if (cep) {
    const result = await tryQuery({ postalcode: cep });
    if (result) return result;
  }

  // Strategy 3: Just the street + city string fallback
  if (street && city) {
    const result = await tryQuery({ q: `${street}, ${city}, ${state}, Brasil` });
    if (result) return result;
  }

  return null;
}

/**
 * Calculates delivery fee based on distance from the store.
 *
 * @param cep - Customer's CEP (8 digits, masked or raw)
 * @param settings - Delivery configuration from admin_settings
 * @param gpsCoords - If provided (user clicked "Usar minha localização"), these
 *   exact coordinates are used and CEP geocoding is skipped entirely.
 */
export function useDeliveryCalculation(
  cep: string,
  settings: DeliverySettings | null,
  gpsCoords?: GpsCoords | null
): DeliveryResult {
  const [result, setResult] = useState<DeliveryResult>({
    distanceKm: null,
    deliveryFee: null,
    outOfRange: false,
    loading: false,
    error: null,
  });

  useEffect(() => {
    const clean = cep.replace(/\D/g, '');

    if (!settings) {
      setResult({ distanceKm: null, deliveryFee: null, outOfRange: false, loading: false, error: null });
      return;
    }

    // ── Fast path: GPS coordinates already known ───────────────────────────────
    if (gpsCoords) {
      const distKm = haversineKm(settings.store_lat, settings.store_lng, gpsCoords.lat, gpsCoords.lon);
      if (distKm > settings.delivery_max_radius_km) {
        setResult({ distanceKm: distKm, deliveryFee: null, outOfRange: true, loading: false, error: null });
      } else {
        setResult({
          distanceKm: distKm,
          deliveryFee: calcFee(distKm, settings),
          outOfRange: false,
          loading: false,
          error: null,
        });
      }
      return;
    }

    // ── CEP geocoding path ─────────────────────────────────────────────────────
    if (clean.length !== 8) {
      setResult({ distanceKm: null, deliveryFee: null, outOfRange: false, loading: false, error: null });
      return;
    }

    setResult(r => ({ ...r, loading: true, error: null }));

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`https://brasilapi.com.br/api/cep/v2/${clean}`);
        const data = await res.json();

        if (data.message || data.type === 'service_error') {
          setResult({ distanceKm: null, deliveryFee: null, outOfRange: false, loading: false, error: 'CEP não encontrado' });
          return;
        }

        let lat: number | null = null;
        let lon: number | null = null;

        // 1st: BrasilAPI native coordinates
        const coords = data.location?.coordinates;
        if (coords?.latitude && coords?.longitude) {
          lat = parseFloat(coords.latitude);
          lon = parseFloat(coords.longitude);
        }

        // 2nd: LocationIQ fallback using address from BrasilAPI
        if (lat === null || lon === null) {
          const lociq = await locationiqGeocode(
            data.street || '',
            data.city || 'São Paulo',
            data.state || 'SP',
            clean
          );
          if (lociq) {
            lat = lociq.lat;
            lon = lociq.lon;
          }
        }

        // Last resort: fail and ask for location
        if (lat === null || lon === null) {
          setResult({
            distanceKm: null,
            deliveryFee: null,
            outOfRange: false,
            loading: false,
            error: 'Endereço não localizado pelo CEP. Por favor, clique em "Usar minha localização".',
          });
          return;
        }

        const distKm = haversineKm(settings.store_lat, settings.store_lng, lat, lon);

        if (distKm > settings.delivery_max_radius_km) {
          setResult({ distanceKm: distKm, deliveryFee: null, outOfRange: true, loading: false, error: null });
        } else {
          setResult({
            distanceKm: distKm,
            deliveryFee: calcFee(distKm, settings),
            outOfRange: false,
            loading: false,
            error: null,
          });
        }
      } catch {
        setResult({
          distanceKm: null,
          deliveryFee: null,
          outOfRange: false,
          loading: false,
          error: 'Endereço não localizado pelo CEP. Por favor, clique em "Usar minha localização".',
        });
      }
    }, 700);

    return () => clearTimeout(timer);
  }, [cep, settings, gpsCoords]);

  return result;
}

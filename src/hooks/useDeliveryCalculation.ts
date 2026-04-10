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
  /** true when no geocoding was possible — fee is the base rate as a fallback */
  usingFallback: boolean;
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

/**
 * Rejects geocoding results that are too far from the store.
 * Prevents wrong-city results (e.g. LocationIQ returning Guarulhos for a SP address).
 * Max plausible customer distance = 3× max delivery radius.
 */
function isReasonableResult(lat: number, lon: number, s: DeliverySettings): boolean {
  const dist = haversineKm(s.store_lat, s.store_lng, lat, lon);
  return dist <= s.delivery_max_radius_km * 3;
}

async function locationiqGeocode(
  street: string,
  city: string,
  state: string,
  cep: string,
  settings: DeliverySettings
): Promise<GpsCoords | null> {
  const apiKey = import.meta.env.VITE_LOCATIONIQ_API_KEY || 'pk.e71d875c8c098f20e60c6ac00ef07f8a';

  const tryQuery = async (params: Record<string, string>): Promise<GpsCoords | null> => {
    try {
      const qParams = new URLSearchParams({ key: apiKey, format: 'json', limit: '1', countrycodes: 'br', ...params });
      const res = await fetch(`https://us1.locationiq.com/v1/search?${qParams.toString()}`);
      if (!res.ok) return null;
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        // Reject if result is suspiciously far from store (wrong city/state)
        if (isReasonableResult(lat, lon, settings)) {
          return { lat, lon };
        }
      }
    } catch { /* network error */ }
    return null;
  };

  if (cep && street) {
    const r = await tryQuery({ postalcode: cep, street });
    if (r) return r;
  }
  if (cep) {
    const r = await tryQuery({ postalcode: cep });
    if (r) return r;
  }
  if (street && city) {
    const r = await tryQuery({ q: `${street}, ${city}, ${state}, Brasil` });
    if (r) return r;
  }
  return null;
}

async function nominatimGeocode(
  street: string,
  neighborhood: string,
  city: string,
  state: string,
  settings: DeliverySettings
): Promise<GpsCoords | null> {
  const headers = { 'Accept-Language': 'pt-BR', 'User-Agent': 'BrunaPerfumaria/1.0' };

  const tryQuery = async (q: string): Promise<GpsCoords | null> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&countrycodes=br`,
        { headers }
      );
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        if (isReasonableResult(lat, lon, settings)) return { lat, lon };
      }
    } catch { /* network error */ }
    return null;
  };

  if (street && neighborhood) {
    const r = await tryQuery(`${street}, ${neighborhood}, ${city}, ${state}, Brasil`);
    if (r) return r;
  }
  if (street) {
    const r = await tryQuery(`${street}, ${city}, ${state}, Brasil`);
    if (r) return r;
  }
  // Neighborhood centroid as last resort — approximate but better than nothing
  if (neighborhood) {
    const r = await tryQuery(`${neighborhood}, ${city}, ${state}, Brasil`);
    if (r) return r;
  }
  return null;
}

export function useDeliveryCalculation(
  cep: string,
  settings: DeliverySettings | null,
  gpsCoords?: GpsCoords | null
): DeliveryResult {
  const [result, setResult] = useState<DeliveryResult>({
    distanceKm: null,
    deliveryFee: null,
    usingFallback: false,
    outOfRange: false,
    loading: false,
    error: null,
  });

  useEffect(() => {
    const clean = cep.replace(/\D/g, '');

    if (!settings) {
      setResult({ distanceKm: null, deliveryFee: null, usingFallback: false, outOfRange: false, loading: false, error: null });
      return;
    }

    // ── GPS fast path: exact coords, skip geocoding entirely ──────────────────
    if (gpsCoords) {
      const distKm = haversineKm(settings.store_lat, settings.store_lng, gpsCoords.lat, gpsCoords.lon);
      if (distKm > settings.delivery_max_radius_km) {
        setResult({ distanceKm: distKm, deliveryFee: null, usingFallback: false, outOfRange: true, loading: false, error: null });
      } else {
        setResult({
          distanceKm: distKm,
          deliveryFee: calcFee(distKm, settings),
          usingFallback: false,
          outOfRange: false,
          loading: false,
          error: null,
        });
      }
      return;
    }

    // ── CEP geocoding path ────────────────────────────────────────────────────
    if (clean.length !== 8) {
      setResult({ distanceKm: null, deliveryFee: null, usingFallback: false, outOfRange: false, loading: false, error: null });
      return;
    }

    setResult(r => ({ ...r, loading: true, error: null, usingFallback: false }));

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`https://brasilapi.com.br/api/cep/v2/${clean}`);
        const data = await res.json();

        if (data.message || data.type === 'service_error') {
          setResult({ distanceKm: null, deliveryFee: null, usingFallback: false, outOfRange: false, loading: false, error: 'CEP não encontrado' });
          return;
        }

        let lat: number | null = null;
        let lon: number | null = null;

        // 1st: BrasilAPI native coordinates
        const coords = data.location?.coordinates;
        if (coords?.latitude && coords?.longitude) {
          const candidateLat = parseFloat(coords.latitude);
          const candidateLon = parseFloat(coords.longitude);
          if (isReasonableResult(candidateLat, candidateLon, settings)) {
            lat = candidateLat;
            lon = candidateLon;
          }
        }

        // 2nd: LocationIQ (with bounds check)
        if (lat === null) {
          const lociq = await locationiqGeocode(
            data.street || '', data.city || 'São Paulo', data.state || 'SP', clean, settings
          );
          if (lociq) { lat = lociq.lat; lon = lociq.lon; }
        }

        // 3rd: Nominatim (with bounds check)
        if (lat === null) {
          const nom = await nominatimGeocode(
            data.street || '', data.neighborhood || '', data.city || 'São Paulo', data.state || 'SP', settings
          );
          if (nom) { lat = nom.lat; lon = nom.lon; }
        }

        // All geocoders failed → charge base fee, don't block checkout
        if (lat === null || lon === null) {
          setResult({
            distanceKm: null,
            deliveryFee: settings.delivery_fee_base,
            usingFallback: true,
            outOfRange: false,
            loading: false,
            error: null,
          });
          return;
        }

        const distKm = haversineKm(settings.store_lat, settings.store_lng, lat, lon);

        if (distKm > settings.delivery_max_radius_km) {
          setResult({ distanceKm: distKm, deliveryFee: null, usingFallback: false, outOfRange: true, loading: false, error: null });
        } else {
          setResult({
            distanceKm: distKm,
            deliveryFee: calcFee(distKm, settings),
            usingFallback: false,
            outOfRange: false,
            loading: false,
            error: null,
          });
        }
      } catch {
        setResult({
          distanceKm: null,
          deliveryFee: settings.delivery_fee_base,
          usingFallback: true,
          outOfRange: false,
          loading: false,
          error: null,
        });
      }
    }, 700);

    return () => clearTimeout(timer);
  }, [cep, settings, gpsCoords]);

  return result;
}

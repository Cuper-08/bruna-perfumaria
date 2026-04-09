import { useState, useEffect } from 'react';

export interface DeliverySettings {
  store_lat: number;
  store_lng: number;
  delivery_fee_base: number;
  delivery_fee_per_km: number;
  delivery_base_radius_km: number;
  delivery_max_radius_km: number;
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

/** Try to get lat/lng from Nominatim using the address returned by BrasilAPI */
async function geocodeWithNominatim(
  street: string,
  neighborhood: string,
  city: string,
  state: string
): Promise<{ lat: number; lon: number } | null> {
  const parts = [street, neighborhood, city, state, 'Brasil'].filter(Boolean);
  const q = encodeURIComponent(parts.join(', '));
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`,
      { headers: { 'Accept-Language': 'pt-BR', 'User-Agent': 'BrunaPerfumaria/1.0' } }
    );
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    }
  } catch {
    // Nominatim unavailable — will fallback to base fee
  }
  return null;
}

export function useDeliveryCalculation(
  cep: string,
  settings: DeliverySettings | null
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

    if (clean.length !== 8 || !settings) {
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

        // 1st try: BrasilAPI coordinates
        const coords = data.location?.coordinates;
        if (coords?.latitude && coords?.longitude) {
          lat = parseFloat(coords.latitude);
          lon = parseFloat(coords.longitude);
        }

        // 2nd try: Nominatim geocoding from BrasilAPI address fields
        if (lat === null || lon === null) {
          const nominatim = await geocodeWithNominatim(
            data.street || '',
            data.neighborhood || '',
            data.city || 'São Paulo',
            data.state || 'SP'
          );
          if (nominatim) {
            lat = nominatim.lat;
            lon = nominatim.lon;
          }
        }

        // No coordinates from either source — charge base fee, don't block checkout
        if (lat === null || lon === null) {
          setResult({
            distanceKm: null,
            deliveryFee: settings.delivery_fee_base,
            outOfRange: false,
            loading: false,
            error: null,
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
        // Network error — fallback to base fee so checkout isn't blocked
        setResult({
          distanceKm: null,
          deliveryFee: settings.delivery_fee_base,
          outOfRange: false,
          loading: false,
          error: null,
        });
      }
    }, 700);

    return () => clearTimeout(timer);
  }, [cep, settings]);

  return result;
}

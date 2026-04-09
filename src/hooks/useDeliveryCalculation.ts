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

        const coords = data.location?.coordinates;

        // BrasilAPI doesn't have coordinates for every CEP — use base fee as fallback
        if (!coords?.latitude || !coords?.longitude) {
          setResult({
            distanceKm: null,
            deliveryFee: settings.delivery_fee_base,
            outOfRange: false,
            loading: false,
            error: null,
          });
          return;
        }

        const distKm = haversineKm(
          settings.store_lat,
          settings.store_lng,
          parseFloat(coords.latitude),
          parseFloat(coords.longitude)
        );

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

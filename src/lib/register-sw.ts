// Register service worker + Core Web Vitals reporter
import { onCLS, onINP, onLCP, onFCP, onTTFB, type Metric } from 'web-vitals';

export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  if (import.meta.env.DEV) return; // Don't register in dev

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('[sw] registration failed:', err);
    });
  });
}

function sendVital(metric: Metric) {
  // Lightweight log; replace with analytics endpoint when you wire GA4/Plausible
  if (import.meta.env.DEV) return;
  console.log(`[web-vitals] ${metric.name}: ${Math.round(metric.value)}ms (${metric.rating})`);
}

export function reportWebVitals() {
  onCLS(sendVital);
  onINP(sendVital);
  onLCP(sendVital);
  onFCP(sendVital);
  onTTFB(sendVital);
}

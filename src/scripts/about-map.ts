/**
 * about-map.ts
 * Leaflet map + pulsing marker for the About bento cell.
 * Reacts to dark/light theme changes via MutationObserver.
 */
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function getMarkerHtml(isDark: boolean): string {
  const color    = isDark ? '#facc15' : '#3b82f6';
  const colorRgb = isDark ? '250,204,21' : '59,130,246';
  return `
    <div style="position:relative;width:28px;height:28px;display:flex;align-items:center;justify-content:center;">
      <div style="position:absolute;width:28px;height:28px;border-radius:50%;background:rgba(${colorRgb},0.35);animation:markerPulse 1.8s ease-out infinite;"></div>
      <div style="position:absolute;width:18px;height:18px;border-radius:50%;background:rgba(${colorRgb},0.2);animation:markerPulse 1.8s ease-out infinite 0.4s;"></div>
      <div style="position:relative;width:12px;height:12px;border-radius:50%;background:${color};box-shadow:0 0 6px rgba(${colorRgb},0.8);cursor:pointer;z-index:1;"></div>
    </div>`;
}

export function initMap(): void {
  const mapEl = document.getElementById('leaflet-map');
  if (!mapEl || (mapEl as any)._leaflet_id) return;

  const isDark = document.documentElement.classList.contains('dark');
  const tileUrl = (dark: boolean) =>
    dark
      ? 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png';

  const map = L.map(mapEl, {
    center: [43.6426, -79.3871],
    zoom: 13,
    zoomControl: false,
    scrollWheelZoom: false,
    dragging: false,
    attributionControl: false,
  });

  L.tileLayer(tileUrl(isDark), { maxZoom: 19 }).addTo(map);

  const marker = L.marker([43.6426, -79.3871], {
    icon: L.divIcon({
      className: '',
      html: getMarkerHtml(isDark),
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    }),
  })
    .addTo(map)
    .on('click', () => {
      window.open(
        'https://www.google.com/maps/place/Torre+CN/@43.6425813,-79.3973351,15z',
        '_blank',
        'noopener,noreferrer'
      );
    });

  // Update tiles + marker on theme change
  const observer = new MutationObserver(() => {
    const dark = document.documentElement.classList.contains('dark');
    map.eachLayer((l: L.Layer) => { if ((l as any)._url) map.removeLayer(l); });
    L.tileLayer(tileUrl(dark), { maxZoom: 19 }).addTo(map);
    marker.setIcon(
      L.divIcon({
        className: '',
        html: getMarkerHtml(dark),
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      })
    );
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
}

import L from 'leaflet';

function createTileLayer(key, maxNativeZoom) {
  return L.tileLayer(`/tiles/${key}/{z}/{x}/{y}`, {
    tileSize: 256,
    maxNativeZoom: maxNativeZoom,
    maxZoom: maxNativeZoom + 1,
    crossOrigin: true,
    noWrap: true,
    detectRetina: false,
    zoomOffset: 0,
  });
}

function attach(map, sources) {
  const layers = {};
  const select = document.getElementById('source');
  sources.forEach((s, i) => {
    const opt = document.createElement('option');
    opt.value = s.key;
    opt.textContent = s.name;
    select.appendChild(opt);
    layers[s.key] = createTileLayer(s.key, s.max_zoom);
    if (i === 0) layers[s.key].addTo(map);
  });

  function applyZoomBounds(layer) {
    const zMin = layer?.options?.minZoom ?? 0;
    const zMax = layer?.options?.maxZoom ?? 19;
    map.setMinZoom(zMin);
    map.setMaxZoom(zMax);
    if (map.getZoom() > zMax) map.setZoom(zMax);
    if (map.getZoom() < zMin) map.setZoom(zMin);
  }

  select.addEventListener('change', () => {
    Object.values(layers).forEach((l) => map.removeLayer(l));
    const layer = layers[select.value];
    layer.addTo(map);
    applyZoomBounds(layer);
  });
  select.value = sources[0].key;
  applyZoomBounds(layers[select.value]);
}

export const LayerPanel = { attach };
export default LayerPanel;

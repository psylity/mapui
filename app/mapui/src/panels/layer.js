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
  const listeners = new Set();
  const select = document.getElementById('source');
  let currentKey;

  sources.forEach((s) => {
    if (select) {
      const opt = document.createElement('option');
      opt.value = s.key;
      opt.textContent = s.name;
      select.appendChild(opt);
    }
    const maxNZ = s.max_zoom ?? s.maxZoom ?? 19;
    layers[s.key] = createTileLayer(s.key, maxNZ);
  });

  function notify() {
    for (const cb of listeners) {
      try { cb(currentKey); } catch {}
    }
  }

  function applyZoomBounds(layer) {
    const zMin = layer?.options?.minZoom ?? 0;
    const zMax = layer?.options?.maxZoom ?? 19;
    map.setMinZoom(zMin);
    map.setMaxZoom(zMax);
    if (map.getZoom() > zMax) map.setZoom(zMax);
    if (map.getZoom() < zMin) map.setZoom(zMin);
  }


  function setActiveByKey(key) {
    if (!layers[key]) return;
    if (key === currentKey && map.hasLayer(layers[key])) {
      return;
    }
    Object.values(layers).forEach((l) => map.removeLayer(l));
    const layer = layers[key];
    layer.addTo(map);
    applyZoomBounds(layer);
    currentKey = key;
    if (select) select.value = key;
    notify();
  }

  function getActiveKey() {
    return currentKey;
  }

  function onActiveChange(cb) {
    if (typeof cb !== 'function') return () => {};
    listeners.add(cb);
    return () => listeners.delete(cb);
  }

  const initialKey = sources[0]?.key;
  if (initialKey) setActiveByKey(initialKey);

  if (select) {
    select.value = initialKey ?? '';
    select.addEventListener('change', () => setActiveByKey(select.value));
  }

  return {
    get: getActiveKey,
    set: setActiveByKey,
    onChange: onActiveChange,
  };
}

export const LayerPanel = { attach };
export default LayerPanel;

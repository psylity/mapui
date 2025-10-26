//   #coords=<lat>,<lon>&zoom=<z>&layer=<key>

function to5(v) {
  return Number.isFinite(v) ? Number(v).toFixed(5) : undefined;
}

export function parseHash() {
  const raw = location.hash.slice(1);
  if (!raw) return null;
  const qs = new URLSearchParams(raw);

  const res = {};
  const coords = qs.get('coords');
  if (coords) {
    const parts = coords.split(',').map(Number);
    if (parts.length === 2 && parts.every(Number.isFinite)) {
      res.lat = parts[0];
      res.lon = parts[1];
    }
  }
  if (qs.has('zoom')) {
    const z = parseInt(qs.get('zoom') || '', 10);
    if (Number.isFinite(z)) res.z = z;
  }
  const layer = qs.get('layer');
  if (layer) res.layer = layer;

  return Object.keys(res).length ? res : null;
}

export function buildHash({ lat, lon, z, layer }) {
  const qs = new URLSearchParams();
  if (Number.isFinite(lat) && Number.isFinite(lon)) {
    qs.set('coords', `${to5(lat)},${to5(lon)}`);
  }
  if (Number.isFinite(z)) qs.set('zoom', String(z));
  if (layer) qs.set('layer', layer);
  const s = qs.toString();
  return s ? '#' + s : '';
}

function writeHashFromMap(map, layerApi) {
  const c = map.getCenter();
  const z = map.getZoom();
  const layer = layerApi && typeof layerApi.get === 'function' ? layerApi.get() : undefined;
  history.replaceState(null, '', buildHash({ lat: c.lat, lon: c.lng, z, layer }));
}

export function bindHash(map, opts) {
  const { defaultView, layerApi, debounceMs = 80 } = opts || {};
  if (!defaultView) {
    throw new Error('bindHash: defaultView is required when hash is empty');
  }

  const start = parseHash();
  if (start?.layer && layerApi?.set) {
    layerApi.set(start.layer);
  }
  if (Number.isFinite(start?.lat) && Number.isFinite(start?.lon)) {
    map.setView([start.lat, start.lon], Number.isFinite(start?.z) ? start.z : map.getZoom());
  } else if (Number.isFinite(start?.z)) {
    map.setZoom(start.z);
  } else {
    map.setView([defaultView.lat, defaultView.lon], defaultView.zoom);
  }

  let t = null;
  const schedule = () => {
    clearTimeout(t);
    t = setTimeout(() => writeHashFromMap(map, layerApi), debounceMs);
  };
  map.on('moveend', schedule);
  map.on('zoomend', schedule);

  const onHashChange = () => {
    const p = parseHash();
    if (!p) return;

    const currentKey = layerApi?.get ? layerApi.get() : undefined;
    if (p.layer && layerApi?.set && p.layer !== currentKey) {
      layerApi.set(p.layer);
    }

    if (Number.isFinite(p.lat) && Number.isFinite(p.lon)) {
      map.setView([p.lat, p.lon], Number.isFinite(p.z) ? p.z : map.getZoom());
    } else if (Number.isFinite(p.z)) {
      map.setZoom(p.z);
    }
  };
  window.addEventListener('hashchange', onHashChange);

  let unsubscribeLayer = null;
  if (layerApi?.onChange) {
    unsubscribeLayer = layerApi.onChange(() => {
      schedule();
    });
  }

  return function detach() {
    clearTimeout(t);
    map.off('moveend', schedule);
    map.off('zoomend', schedule);
    window.removeEventListener('hashchange', onHashChange);
    if (typeof unsubscribeLayer === 'function') unsubscribeLayer();
  };
}

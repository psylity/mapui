import L from 'leaflet';

export function metersReadable(m) {
  return m < 1000 ? `${m.toFixed(0)} м` : `${(m / 1000).toFixed(2)} км`;
}

export function attachRuler(map, { button, statusSet }) {
  let measuring = false;
  let measurePts = [];
  let measureLine = null;
  let measureHint = null;
  let measureFinals = [];

  function clearFinals() {
    for (const f of measureFinals) {
      if (f.line && map.hasLayer(f.line)) map.removeLayer(f.line);
      if (f.label && map.hasLayer(f.label)) map.removeLayer(f.label);
    }
    measureFinals.length = 0;
  }

  function totalDistance(pts) {
    let d = 0;
    for (let i = 1; i < pts.length; i++) d += pts[i - 1].distanceTo(pts[i]);
    return d;
  }

  function updateMeasureStatus(cursor) {
    let d = totalDistance(measurePts);
    if (cursor && measurePts.length) d += measurePts[measurePts.length - 1].distanceTo(cursor);
    if (statusSet) statusSet(cursor || map.getCenter(), `Дистанция: ${metersReadable(d)}`);
  }

  function onMeasureClick(e) {
    measurePts.push(e.latlng);
    if (!measureLine) {
      measureLine = L.polyline([e.latlng], { color: '#1976d2', weight: 2 }).addTo(map);
    } else {
      measureLine.addLatLng(e.latlng);
    }
    updateMeasureStatus();
  }

  function onMeasureMove(e) {
    if (!measuring || !measurePts.length) return;
    const last = measurePts[measurePts.length - 1];
    const seg = [last, e.latlng];
    if (!measureHint) {
      measureHint = L.polyline(seg, { color: '#1976d2', weight: 1, dashArray: '4,4' }).addTo(map);
    } else {
      measureHint.setLatLngs(seg);
    }
    updateMeasureStatus(e.latlng);
  }

  function onMeasureDblClick(e) {
    if (e && e.originalEvent && typeof e.originalEvent.preventDefault === 'function') {
      e.originalEvent.preventDefault();
    }
    finishMeasure();
  }

  function finishMeasure() {
    if (!measuring) return;
    if (measurePts.length < 2) {
      setMeasuring(false);
      return;
    }

    const dist = totalDistance(measurePts);
    const last = measurePts[measurePts.length - 1];

    const label = L.marker(last, {
      interactive: false,
      icon: L.divIcon({
        className: 'measure-label',
        html: metersReadable(dist),
        iconSize: null,
      }),
    }).addTo(map);

    measureFinals.push({ line: measureLine, label });

    if (measureHint) {
      map.removeLayer(measureHint);
      measureHint = null;
    }

    map.off('click', onMeasureClick);
    map.off('mousemove', onMeasureMove);
    map.off('dblclick', onMeasureDblClick);
    map.getContainer().style.cursor = '';
    map.doubleClickZoom && map.doubleClickZoom.enable();
    if (button) button.classList.remove('active');

    measuring = false;
    measureLine = null;
    measurePts = [];
    if (statusSet) statusSet(map.getCenter());
  }

  function setMeasuring(on) {
    measuring = on;
    if (button) button.classList.toggle('active', on);

    if (on) {
      clearFinals();
      if (measureLine && map.hasLayer(measureLine)) map.removeLayer(measureLine);
      measureLine = null;
      if (measureHint && map.hasLayer(measureHint)) map.removeLayer(measureHint);
      measureHint = null;
      measurePts = [];

      map.getContainer().style.cursor = 'crosshair';
      map.on('click', onMeasureClick);
      map.on('mousemove', onMeasureMove);
      map.on('dblclick', onMeasureDblClick);
      map.doubleClickZoom && map.doubleClickZoom.disable();
    } else {
      map.getContainer().style.cursor = '';
      map.off('click', onMeasureClick);
      map.off('mousemove', onMeasureMove);
      map.off('dblclick', onMeasureDblClick);
      map.doubleClickZoom && map.doubleClickZoom.enable();

      if (measureLine && map.hasLayer(measureLine)) map.removeLayer(measureLine);
      measureLine = null;
      if (measureHint && map.hasLayer(measureHint)) map.removeLayer(measureHint);
      measureHint = null;
      measurePts = [];
      clearFinals();
      if (statusSet) statusSet(map.getCenter());
    }
  }

  const onBtnClick = (e) => {
    e.preventDefault();
    setMeasuring(!measuring);
  };
  if (button) button.addEventListener('click', onBtnClick);

  return {
    detach() {
      if (button) button.removeEventListener('click', onBtnClick);
      setMeasuring(false);
    },
  };
}

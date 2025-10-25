import { toDMS, toDMSH, parseLatLon } from './dms.js';

export function attachStatus(map, { statusEl, gotoBtn, initialMode = 'dms' }) {
  let _displayMode = initialMode; // 'dms' | 'dec'
  let _statusEditing = false;
  let _editInput = null;
  let _clickTimer = null;
  let _lastPoint = null;

  function formatCoords(ll) {
    return _displayMode === 'dms'
      ? `${toDMSH(ll.lat, true)}, ${toDMSH(ll.lng, false)}`
      : `${ll.lat.toFixed(5)}, ${ll.lng.toFixed(5)}`;
  }

  function setStatus(ll, extra) {
    if (_statusEditing) return;
    const c = ll || map.getCenter();
    const base = formatCoords(c);
    statusEl.textContent = extra ? `${base} | ${extra}` : base;
  }

  const onClick = (e) => {
    _lastPoint = e.latlng;
    setStatus(e.latlng);
  };
  const onZoomEnd = () => setStatus(_lastPoint || map.getCenter());
  map.on('click', onClick);
  map.on('zoomend', onZoomEnd);
  setStatus(map.getCenter());

  function beginInlineEdit() {
    if (_statusEditing) return;
    _statusEditing = true;
    statusEl.innerHTML = '';

    const ll = _lastPoint || map.getCenter();
    const input = document.createElement('input');
    input.type = 'text';
    input.value =
      _displayMode === 'dms'
        ? `${toDMS(ll.lat)}, ${toDMS(ll.lng)}`
        : `${ll.lat.toFixed(6)}, ${ll.lng.toFixed(6)}`;
    input.setAttribute('aria-label', 'Координаты (широта, долгота)');
    statusEl.appendChild(input);
    _editInput = input;

    function cancel() {
      _statusEditing = false;
      _editInput = null;
      setStatus(_lastPoint || map.getCenter());
    }
    function apply() {
      if (!_editInput) return;
      const parsed = parseLatLon(_editInput.value);
      if (!parsed) {
        alert('Неверный формат');
        return;
      }
      map.setView([parsed.lat, parsed.lon], map.getZoom());
      _statusEditing = false;
      _editInput = null;
      setStatus({ lat: parsed.lat, lng: parsed.lon });
    }

    input.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') {
        ev.preventDefault();
        apply();
      }
      if (ev.key === 'Escape') {
        ev.preventDefault();
        cancel();
      }
    });

    input._apply = apply;
    input._cancel = cancel;

    input.focus();
    input.select();
  }

  if (gotoBtn) {
    gotoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (!_statusEditing) beginInlineEdit();
      else if (_editInput && typeof _editInput._apply === 'function') _editInput._apply();
    });
  }

  statusEl.addEventListener('click', (e) => {
    if (_statusEditing) return;
    e.preventDefault();
    clearTimeout(_clickTimer);
    _clickTimer = setTimeout(() => {
      _displayMode = _displayMode === 'dec' ? 'dms' : 'dec';
      setStatus(_lastPoint || map.getCenter());
    }, 200);
  });
  statusEl.addEventListener('dblclick', (e) => {
    e.preventDefault();
    clearTimeout(_clickTimer);
    beginInlineEdit();
  });

  return {
    setStatus,
    detach() {
      map.off('click', onClick);
      map.off('zoomend', onZoomEnd);
    },
  };
}

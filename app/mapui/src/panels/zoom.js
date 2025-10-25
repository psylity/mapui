import L from 'leaflet';

function attach(map, opts) {
  const panel = document.getElementById(opts.panelId || 'zoom-panel');
  const btnIn = document.getElementById(opts.btnIn || 'zoom-in');
  const btnOut = document.getElementById(opts.btnOut || 'zoom-out');
  const label = document.getElementById(opts.label || 'zoom-level');

  const corner = document.querySelector('#map .leaflet-top.leaflet-right');
  corner.appendChild(panel);
  L.DomUtil.addClass(panel, 'leaflet-control');

  L.DomEvent.disableClickPropagation(panel);
  L.DomEvent.disableScrollPropagation(panel);

  label.textContent = map.getZoom();
  map.on('zoomend', () => {
    label.textContent = map.getZoom();
  });

  btnOut.addEventListener('click', (e) => {
    e.preventDefault();
    map.zoomOut();
  });
  btnIn.addEventListener('click', (e) => {
    e.preventDefault();
    map.zoomIn();
  });

  [btnOut, btnIn].forEach((el) => {
    el.setAttribute('tabindex', '0');
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        el.click();
      }
    });
  });
}

export const ZoomPanel = { attach };
export default ZoomPanel;

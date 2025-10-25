import L from 'leaflet';

export function attachPanel(map, ids) {
  const panelEl = document.getElementById(ids.panelId);
  const statusEl = document.getElementById(ids.statusId);
  const btnGeo = document.getElementById(ids.geolocBtn);
  const btnMeas = document.getElementById(ids.measureBtn);
  const btnGoto = document.getElementById(ids.gotoBtn);

  if (!panelEl || !statusEl) {
    throw new Error('ToolsPanel: panel or status element not found');
  }

  const corner = document.querySelector('#map .leaflet-bottom.leaflet-right');
  if (corner && panelEl) {
    corner.appendChild(panelEl);
    L.DomUtil.addClass(panelEl, 'leaflet-control');
    if (L.DomEvent) {
      L.DomEvent.disableClickPropagation(panelEl);
      L.DomEvent.disableScrollPropagation(panelEl);
    }
  }

  return { panelEl, statusEl, btnGeo, btnMeas, btnGoto };
}

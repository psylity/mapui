import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { INITIAL_VIEW, SOURCES } from './config.js';
import { LayerPanel } from './panels/layer.js';
import { ToolsPanel } from './panels/tools/index.js';
import { ZoomPanel } from './panels/zoom.js';

const map = L.map('map', {
  worldCopyJump: false,
  noWrap: true,
  minZoom: 0,
  maxZoom: 19,
  zoomControl: false,
  attributionControl: false,
  wheelPxPerZoomLevel: 120,
  zoomSnap: 1,
}).setView([INITIAL_VIEW.lat, INITIAL_VIEW.lon], INITIAL_VIEW.zoom);

LayerPanel.attach(map, SOURCES);

L.control.scale({ imperial: false }).addTo(map);

ToolsPanel.attach(map, {
  panelId: 'br-panel',
  statusId: 'coord-status',
  geolocBtn: 'btn-geoloc',
  measureBtn: 'btn-measure',
  gotoBtn: 'btn-goto',
  displayMode: 'dms',
});

ZoomPanel.attach(map, {
  panelId: 'zoom-panel',
  btnIn: 'zoom-in',
  btnOut: 'zoom-out',
  label: 'zoom-level',
});

import { attachPanel } from './panel.js';
import { attachStatus } from './status.js';
import { attachGeolocate } from './geolocate.js';
import { attachRuler } from './ruler.js';

export const ToolsPanel = {
  attach(map, opts) {
    const { statusEl, btnGeo, btnMeas, btnGoto } = attachPanel(map, {
      panelId: opts.panelId || 'br-panel',
      statusId: opts.statusId || 'coord-status',
      geolocBtn: opts.geolocBtn || 'btn-geoloc',
      measureBtn: opts.measureBtn || 'btn-measure',
      gotoBtn: opts.gotoBtn || 'btn-goto',
    });

    const statusCtl = attachStatus(map, {
      statusEl,
      gotoBtn: btnGoto,
      initialMode: opts.displayMode || 'dms', // 'dms'|'dec'
    });

    const geoCtl = attachGeolocate(map, { button: btnGeo });

    const rulerCtl = attachRuler(map, {
      button: btnMeas,
      statusSet: statusCtl.setStatus,
    });

    return {
      detach() {
        rulerCtl.detach();
        geoCtl.detach();
        statusCtl.detach();
      },
    };
  },
};

export default ToolsPanel;

# Map UI

A minimalist Leaflet-based web UI for viewing tiled maps with source switching, a ruler, “jump to coordinates”, and coordinate display.

The project is split into the frontend (`app/mapui/`) and Nginx example configs (`contrib/`) with an njs router for tiles.

## Features
* Switch between map sources (tile layers).
* “Tools” panel:
  * Display coordinates of the last click and jump to entered coordinates. The coordinate parser accepts both input formats:
    * Decimal: 58.75258, 42.65622
    * DMS: 56°40'05.89"N, 42°47'45.12"E (supports * instead of °, various minute/second quotes, and N/S/E/W at the start or end).
* Ruler
* Geolocation
* Tile URL: /tiles/{maptype}/{z}/{x}/{y}[.ext], proxied to a SAS.Planet-like on-disk cache layout via njs.

## Screenshot

![Map UI screenshot](docs/assets/screenshot.png)

## Build
```
cd apps/map-ui
npm run build
# copy apps/map-ui/dist/ to your web server’s document root
```

## Tile layout
Expected structure on disk:
```
/data/maps/<Base>/z<Z>/<Xdir>/x<X>/<Ydir>/y<Y>.<ext>
where Xdir = floor(X / 1024), Ydir = floor(Y / 1024)
```

Mapping examples in `contrib/nginx/maptiles.js`:
```
const maps = {
  topo:   { kind: 'sas', base: 'Topomapper',         ext: 'jpg' },
  sat:    { kind: 'sas', base: 'Esri-Clarity-Cache', ext: 'jpg' },
  <...>
};
```

## Configuring sources and initial view
Edit `apps/map-ui/src/config.js`:
```
export const INITIAL_VIEW = { lat: 58.75258, lon: 42.65622, zoom: 13 };

export const SOURCES = [
  { key: 'sat',  name: 'Satellite', url: '/tiles/sat/{z}/{x}/{y}',  options: { maxNativeZoom: 18, maxZoom: 19, noWrap: true } },
  { key: 'topo', name: 'Topomap',   url: '/tiles/topo/{z}/{x}/{y}', options: { maxZoom: 19, noWrap: true } },
  // ...
];
```

## Deploy
In this project, tiles are served by `Nginx` through an njs-based JavaScript router. This is used to convert client-facing requests of the form `/tiles/{maptype}/{z}/{x}/{y}[.ext]` on the fly into the **SAS.Planet** sharded on-disk cache layout, where tiles are stored at paths like:
```
/maps/<Base>/z<Z>/<Xdir>/x<X>/<Ydir>/y<Y>.<ext>
where  Xdir = floor(X / 1024),  Ydir = floor(Y / 1024)
```

The logic is as follows: the njs script reads `maptype, z, x, y` (and `ext`, if present) from the request, picks the map configuration from `maps[maptype]` (which defines the `Base` folder, extension, and type — `sas` or `xyz`), then computes the sharding directories:
```
const Xdir = Math.floor(x / 1024);
const Ydir = Math.floor(y / 1024);
const Zdir = m.zPlusOne ? (z + 1) : z;
const target = `/maps/${m.base}/z${Zdir}/${Xdir}/x${x}/${Ydir}/y${y}.${m.ext}`;
```

The router then returns an internal URI (`/maps/...`), and Nginx serves the corresponding file from disk via `try_files`. For sources whose cache is already flat (`xyz`), the router builds the path directly as `/maps/<Base>/<z>/<x>/<y>.<ext>` — without sharding.

This routing requires the `njs` module (the nginx JavaScript module) so you can `js_import` the script and use it in `js_set` to compute the internal path.
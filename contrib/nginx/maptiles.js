function route(r) {

  const maps = {
    topo: { kind: 'sas', base: 'Topomapper', ext: 'jpg' },
    sat: { kind: 'sas', base: 'Esri-Clarity-Cache', ext: 'jpg' },
    ggc500: { kind: 'sas', base: 'GGC500', ext: 'png' },
    ggc250: { kind: 'sas', base: 'GGC250', ext: 'png' }
  };


  const maptype = r.variables.maptype;
  const z = Number(r.variables.z);
  const x = Number(r.variables.x);
  const y = Number(r.variables.y);

  let m = maps[maptype];

  if (!m) {
    return '/maps/notile.jpg';
  }

  if (m.kind === 'xyz') {
    return `/maps/${m.base}/${z}/${x}/${y}.${m.ext}`;
  }

  if (m.kind === 'sas') {
    const zOut = z + 1;
    const xd = Math.floor(x / 1024);
    const yd = Math.floor(y / 1024);
    return `/maps/${m.base}/z${zOut}/${xd}/x${x}/${yd}/y${y}.${m.ext}`;
  }

  return '/404';
}

export default { route };

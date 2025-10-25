function toDMSAbs(value) {
  let v = Math.abs(value);
  let d = Math.floor(v);
  let mf = (v - d) * 60;
  let m = Math.floor(mf);
  let s = (mf - m) * 60;

  s = Math.round(s * 100) / 100;
  if (s >= 60) {
    s = 0;
    m += 1;
  }
  if (m >= 60) {
    m = 0;
    d += 1;
  }

  const sStr =
    Math.abs(s - Math.round(s)) < 1e-9 ? String(Math.round(s)).padStart(2, '0') : s.toFixed(2);

  return `${d}°${String(m).padStart(2, '0')}'${sStr}"`;
}

export function toDMS(value) {
  const sign = value < 0 ? '-' : '';
  return sign + toDMSAbs(value);
}

export function toDMSH(value, isLat) {
  const hemi = isLat ? (value < 0 ? 'S' : 'N') : value < 0 ? 'W' : 'E';
  return `${toDMSAbs(value)}${hemi}`;
}

export function parseDMSOne(src, isLat) {
  if (!src) return null;
  let s = String(src);

  s = s
    .replace(/\u00A0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  s = s.replace(/,/g, '.');

  let hemi = null;
  const startH = s.match(/^[NSEW]/i);
  const endH = s.match(/[NSEW]$/i);
  if (startH) hemi = startH[0].toUpperCase();
  else if (endH) hemi = endH[0].toUpperCase();
  s = s.replace(/^[NSEW]\s*/i, '').replace(/\s*[NSEW]$/i, '');

  s = s
    .replace(/[*º˚]/g, '°')
    .replace(/[’′ʹ']/g, "'")
    .replace(/[″ʺ"]/g, '"');

  let m = s.match(/^([+-]?\d+(?:\.\d+)?)\s*°\s*(\d+(?:\.\d+)?)\s*'\s*(\d+(?:\.\d+)?)\s*"$/);
  if (m) {
    let deg = parseFloat(m[1]),
      min = parseFloat(m[2]),
      sec = parseFloat(m[3]);
    if ([deg, min, sec].some(Number.isNaN)) return null;
    if (sec >= 60) {
      min += Math.floor(sec / 60);
      sec = sec % 60;
    }
    if (min >= 60) {
      deg += Math.floor(min / 60);
      min = min % 60;
    }
    let val = Math.abs(deg) + min / 60 + sec / 3600;
    let sign = deg < 0 ? -1 : 1;
    if (hemi === 'S' || hemi === 'W') sign *= -1;
    val *= sign;
    if (isLat && Math.abs(val) > 90 + 1e-8) return null;
    if (!isLat && Math.abs(val) > 180 + 1e-8) return null;
    return val;
  }

  m = s.match(/^([+-]?\d+(?:\.\d+)?)\s*°\s*(\d+(?:\.\d+)?)\s*'$/);
  if (m) {
    let deg = parseFloat(m[1]),
      min = parseFloat(m[2]);
    if ([deg, min].some(Number.isNaN)) return null;
    if (min >= 60) {
      deg += Math.floor(min / 60);
      min = min % 60;
    }
    let val = Math.abs(deg) + min / 60;
    let sign = deg < 0 ? -1 : 1;
    if (hemi === 'S' || hemi === 'W') sign *= -1;
    val *= sign;
    if (isLat && Math.abs(val) > 90 + 1e-8) return null;
    if (!isLat && Math.abs(val) > 180 + 1e-8) return null;
    return val;
  }

  if (/^[+-]?\d+(?:\.\d+)?$/.test(s)) {
    let val = parseFloat(s);
    if (hemi === 'S' || hemi === 'W') val = -Math.abs(val);
    if (hemi === 'N' || hemi === 'E') val = Math.abs(val);
    if (isLat && Math.abs(val) > 90 + 1e-8) return null;
    if (!isLat && Math.abs(val) > 180 + 1e-8) return null;
    return val;
  }

  const nums = s.match(/[+-]?\d+(?:\.\d+)?/g);
  if (nums && nums.length >= 1) {
    let deg = parseFloat(nums[0]);
    let min = nums.length >= 2 ? parseFloat(nums[1]) : 0;
    let sec = nums.length >= 3 ? parseFloat(nums[2]) : 0;
    if ([deg, min, sec].some(Number.isNaN)) return null;
    if (sec >= 60) {
      min += Math.floor(sec / 60);
      sec = sec % 60;
    }
    if (min >= 60) {
      deg += Math.floor(min / 60);
      min = min % 60;
    }
    let val = Math.abs(deg) + min / 60 + sec / 3600;
    let sign = deg < 0 ? -1 : 1;
    if (hemi === 'S' || hemi === 'W') sign *= -1;
    val *= sign;
    if (isLat && Math.abs(val) > 90 + 1e-8) return null;
    if (!isLat && Math.abs(val) > 180 + 1e-8) return null;
    return val;
  }

  return null;
}

export function parseLatLon(input) {
  if (!input) return null;
  let s = input.replace(/\u00A0/g, ' ').trim();

  const parts = s
    .split(/[;,]/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length === 2) {
    let lat = parseDMSOne(parts[0], true);
    let lon = parseDMSOne(parts[1], false);
    if (lat == null || lon == null) {
      lat = parseDMSOne(parts[1], true);
      lon = parseDMSOne(parts[0], false);
    }
    return lat == null || lon == null ? null : { lat, lon };
  }

  const ws = s.replace(/[;,]+/g, ' ').trim().split(/\s+/);
  if (ws.length >= 2) {
    let a = parseDMSOne(ws[0], true);
    let b = parseDMSOne(ws[1], false);
    if (a != null && b != null) return { lat: a, lon: b };
    a = parseDMSOne(ws[0], false);
    b = parseDMSOne(ws[1], true);
    if (a != null && b != null) return { lat: b, lon: a };
  }

  return null;
}

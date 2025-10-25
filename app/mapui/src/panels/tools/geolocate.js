import L from 'leaflet';

export function attachGeolocate(map, { button } = {}) {
  if (!button) return { detach() {} };

  function redirectToHttpsIfNeeded() {
    if (
      location.protocol !== 'https:' &&
      location.hostname !== 'localhost' &&
      location.hostname !== '127.0.0.1'
    ) {
      const httpsUrl =
        'https://' + location.host + location.pathname + location.search + location.hash;
      try {
        window.location.replace(httpsUrl);
      } catch {
        window.location.href = httpsUrl;
      }
      return true;
    }
    return false;
  }

  function geolocate() {
    if (redirectToHttpsIfNeeded()) return;
    if (!window.isSecureContext && location.hostname !== 'localhost') {
      alert('Геолокация недоступна: откройте по HTTPS или через http://localhost');
      return;
    }
    if (!navigator.geolocation) {
      alert('Геолокация не поддерживается браузером');
      return;
    }

    button.disabled = true;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        button.disabled = false;
        const { latitude, longitude, accuracy = 0 } = pos.coords;
        const z = Math.max(map.getZoom(), 14);
        map.setView([latitude, longitude], z);

        if (window._geoLayer) {
          if (window._geoLayer.marker) map.removeLayer(window._geoLayer.marker);
          if (window._geoLayer.circle) map.removeLayer(window._geoLayer.circle);
        }
        window._geoLayer = {
          marker: L.circleMarker([latitude, longitude], {
            radius: 6,
            weight: 2,
            color: '#1976d2',
            fillOpacity: 0.5,
          }).addTo(map),
          circle: L.circle([latitude, longitude], {
            radius: accuracy,
            weight: 1,
            color: '#1976d2',
            opacity: 0.4,
            fillOpacity: 0.1,
          }).addTo(map),
        };
      },
      (err) => {
        button.disabled = false;
        alert(`Не удалось получить геопозицию (${err.code}): ${err.message || ''}`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
    );
  }

  const onClick = (e) => {
    e.preventDefault();
    geolocate();
  };
  button.addEventListener('click', onClick);

  return {
    detach() {
      button.removeEventListener('click', onClick);
    },
  };
}

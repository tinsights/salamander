import { setView } from './view.js';

export function addToggleButton(model, view) {
  const toggleBtn = document.getElementById('toggleBtn');

  function toggleView() {
    view.currentStyle = view.currentStyle === 'defaultStyle' ? 'resultStyle' : 'defaultStyle';
    console.log(view);
    Object.values(model).forEach((year) => {
      setView(year.CONSTITUENCIES, view.currentStyle);
    });
  }

  toggleBtn.addEventListener('click', toggleView);
}

export async function addPostalSearchEvent(model, view) {
  const postalCodeBtn = document.getElementById('postalCodeBtn');
  postalCodeBtn.addEventListener('click', async () => {
    const address = await axios.get(
      `https://developers.onemap.sg/commonapi/search?searchVal=${postalCodeSelector.value}&returnGeom=Y&getAddrDetails=N`,
    );
    const coordinates = address.data.results[0];
    const point = {
      lat: coordinates.LATITUDE,
      lng: coordinates.LONGITUDE,
    };
    const addressMarker = L.marker([point.lat, point.lng]);
    const { layers } = view;
    const history = getHistory(layers, point);
    addressMarker.bindPopup(history);
    addressMarker.addTo(view.map);
    view.map.flyTo([point.lat, point.lng], 15);
    addressMarker.openPopup();
  });

  function getHistory(mapLayers, point) {
    const constituencyHistory = document.createElement('div');
    Object.entries(mapLayers).forEach(([year, yearLayer]) => yearLayer.eachLayer((geojsonLayer) => {
      geojsonLayer.eachLayer((polygon) => {
        if (polygon.contains(point)) {
          console.log(year);
          constituencyHistory.innerHTML += `<p>${year}: ${polygon.feature.properties.ED_DESC}</p>`;
        }
      });
    }));
    console.log(constituencyHistory);
    return constituencyHistory;
  }
}

export function darkmodeWatcher(view) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
    const colorScheme = event.matches ? 'dark' : 'light';
    switch (colorScheme) {
      case 'dark':
        L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
          maxZoom: 20,
          // attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
        }).addTo(view.map);
        break;

      case 'light':
      default:
        L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
          maxZoom: 20,
          // attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
        }).addTo(view.map);
        break;
    }
  });
}

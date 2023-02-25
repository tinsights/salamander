let view = {};
let model = {};
window.addEventListener('DOMContentLoaded', async () => {
  view = initView();
  console.log(view);
  // addPostalSearchEvent(model, view);
  model = await generateModel([2006, 2011, 2015, 2020]);
  // const layers = createLayers(model);
  console.log(model);
  addLayersToMap(model, view);
  // toggleButton(model, view);
});

async function addPostalSearchEvent(model, view) {
  const postalCodeBtn = document.getElementById('postalCodeBtn');
  postalCodeBtn.addEventListener('click', async () => {
    const address = await axios.get(`https://developers.onemap.sg/commonapi/search?searchVal=${postalCodeSelector.value}&returnGeom=Y&getAddrDetails=N`);
    const coordinates = address.data.results[0];
    const point = {
      lat: coordinates.LATITUDE,
      lng: coordinates.LONGITUDE,
    };
    const addressMarker = L.marker([point.lat, point.lng]);
    const layers = Object.values(model);
    const history = getHistory(layers, point);
    addressMarker.bindPopup(JSON.stringify(history));
    addressMarker.addTo(view);
    view.flyTo([point.lat, point.lng], 15);
  });

  function getHistory(layers, point) {
    const constituencyHistory = [];
    Object.values(layers).forEach((yearLayer) => yearLayer.eachLayer((sublayer) => {
      if (sublayer.contains(point)) {
        constituencyHistory.push(sublayer.feature.properties);
      }
    }));
    console.log(constituencyHistory);
    return constituencyHistory;
  }
}

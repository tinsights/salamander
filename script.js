const allConstituencies = {};
window.addEventListener("DOMContentLoaded", async () => {
  const view = initView();
  const model = await generateModel([2006, 2011, 2015, 2020]);
  addPostalSearchEvent(model, view);

  console.log(model);
  addLayersToMap(model, view);
  addToggleButton(model, view);
  createChart(model);
});

async function addPostalSearchEvent(model, view) {
  const postalCodeBtn = document.getElementById("postalCodeBtn");
  postalCodeBtn.addEventListener("click", async () => {
    const address = await axios.get(
      `https://developers.onemap.sg/commonapi/search?searchVal=${postalCodeSelector.value}&returnGeom=Y&getAddrDetails=N`
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
    const constituencyHistory = document.createElement("div");
    Object.entries(mapLayers).forEach(([year, yearLayer]) =>
      yearLayer.eachLayer((geojsonLayer) => {
        geojsonLayer.eachLayer((polygon) => {
          if (polygon.contains(point)) {
            console.log(year);
            constituencyHistory.innerHTML += `<p>${year}: ${polygon.feature.properties.ED_DESC}</p>`;
          }
        });
      })
    );
    console.log(constituencyHistory);
    return constituencyHistory;
  }
}

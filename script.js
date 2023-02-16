/* eslint-disable max-len */
/* eslint-disable no-use-before-define */
window.addEventListener('DOMContentLoaded', async () => {
  const map = initMap();
  await addLayersToMap(map);
  await addPostalSearchEvent(map);
});

function initMap() {
  const map = L.map('map').setView([1.3521, 103.8198], 13);

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);
  return map;
}

async function addLayersToMap(map) {
  const twoThousandSix = await axios.get('data/electoral-boundary-2006/electoral-boundary-2006-geojson.geojson');
  console.table(twoThousandSix.data);
  const twoThousandSixResults = await electionResults(2006);
  console.log(twoThousandSixResults);
  const twoThousandSixLayer = L.geoJson(twoThousandSix.data, {
    onEachFeature: (feature, layer) => {
      // const constituencyName = feature.properties.Description;
      // const constituencyResults = twoThousandSixResults.filter((result) => result.constituency === feature.properties.Description);
      // console.log(constituencyResults);
      const e = document.createElement('div');
      e.innerHTML = feature.properties.Description;
      const ths = Array.from(e.querySelectorAll('th'));
      const tds = Array.from(e.querySelectorAll('td'));
      // tds.forEach((td) => console.log(td.innerText));
      // ths.forEach((th) => console.log(th.innerText));
      const constituencyDescription = Object.fromEntries(tds.map((td, idx) => [ths[idx + 1].innerText, td.innerText]));
      console.log(constituencyDescription);
      layer.bindPopup(feature.properties.Description);
    },
  });

  const twoThousandEleven = await axios.get('data/electoral-boundary-2011/electoral-boundary-2011-geojson.geojson');
  // console.table(twoThousandEleven.data);
  const twoThousandElevenLayer = L.geoJson(twoThousandEleven.data, {
    onEachFeature: (feature, layer) => { layer.bindPopup(feature.properties.Description); },
  });

  const twentyFifteen = await axios.get('data/electoral-boundary-2015/electoral-boundary-2015-geojson.geojson');
  // console.table(twentyFifteen.data);
  const twentyFifteenLayer = L.geoJson(twentyFifteen.data, {
    onEachFeature: (feature, layer) => { layer.bindPopup(feature.properties.Description); },
  });

  const twentyTwenty = await axios.get('data/electoral-boundary-2020/electoral-boundary-2020-geojson.geojson');
  // console.table(twentyTwenty.data);
  const twentyTwentyLayer = L.geoJson(twentyTwenty.data, {
    onEachFeature: (feature, layer) => { layer.bindPopup(feature.properties.Name); },
  });

  twentyTwentyLayer.addTo(map);

  const baseLayers = {
    2006: twoThousandSixLayer,
    2011: twoThousandElevenLayer,
    2015: twentyFifteenLayer,
    2020: twentyTwentyLayer,
  };
  L.control.layers(baseLayers).addTo(map);
  return null;
}

async function addPostalSearchEvent(map) {
  const postalCodeBtn = document.getElementById('postalCodeBtn');
  postalCodeBtn.addEventListener('click', async () => {
    const address = await axios.get(`https://developers.onemap.sg/commonapi/search?searchVal=${postalCodeSelector.value}&returnGeom=Y&getAddrDetails=N`);
    console.log(address.data.results[0]);
    const coordinates = address.data.results[0];
    const addressMarker = L.marker([coordinates.LATITUDE, coordinates.LONGITUDE]);
    addressMarker.bindPopup(coordinates.SEARCHVAL);
    addressMarker.addTo(map);
  });
}

async function electionResults(year) {
  const yearResultsResponse = await axios.get(`https://data.gov.sg/api/action/datastore_search?resource_id=4706f2cb-a909-4cc0-bd3d-f366c34cf6af&q=${year}`);
  const yearResults = yearResultsResponse.data.result.records;
  console.log(yearResults);
  return yearResults;
}

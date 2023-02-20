/* eslint-disable max-len */
/* eslint-disable no-use-before-define */
window.addEventListener('DOMContentLoaded', async () => {
  const map = initMap();
  addLayersToMap(map);
  addPostalSearchEvent(map);
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
  const [
    twoThousandSixLayer,
    twoThousandElevenLayer,
    twentyFifteenLayer,
    twentyTwentyLayer,
  ] = await Promise.all([createLayer(2006), createLayer(2011), createLayer(2015), createLayer(2020)]);

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
    // console.log(address.data.results[0]);
    const coordinates = address.data.results[0];
    const addressMarker = L.marker([coordinates.LATITUDE, coordinates.LONGITUDE]);
    addressMarker.bindPopup(coordinates.SEARCHVAL);
    addressMarker.addTo(map);
  });
}

// function htmlTableToJson(htmlTable) {
//   const e = document.createElement('div');
//   e.innerHTML = htmlTable;
//   const ths = Array.from(e.querySelectorAll('th'));
//   const tds = Array.from(e.querySelectorAll('td'));
//   const constituencyDescription = Object.fromEntries(tds.map((td, idx) => [ths[idx + 1].innerText, td.innerText]));
//   return constituencyDescription;
// }

async function createLayer(year) {
  const [yearResults, yearBoundaries] = await getYearLayerData(year);
  const yearLayer = L.geoJson(yearBoundaries, {
    onEachFeature: (feature, layer) => {
      // console.log(feature.properties);
      const constituencyName = feature.properties.ED_DESC;
      const constituencyResults = yearResults.filter((result) => result.constituency.toUpperCase() === constituencyName);
      layer.bindPopup(JSON.stringify(constituencyResults));
    },
    style: (feature) => {
      console.log(feature.properties.ED_DESC.toUpperCase());
      switch (feature.properties.ED_DESC) {
        case 'ALJUNIED': {
          return {
            color: 'FF0000',
            fillColor: 'red',
          };
        }
        default: return { color: 'blue' };
      }
    },
  });
  return yearLayer;
}

async function getYearLayerData(year) {
  const yearResultsReq = electionResults(year);
  const yearBoundariesReq = electionBoundaries(year);
  return Promise.all([yearResultsReq, yearBoundariesReq]);
}

async function electionResults(year) {
  const yearResultsResponse = await axios.get(`https://data.gov.sg/api/action/datastore_search?resource_id=4706f2cb-a909-4cc0-bd3d-f366c34cf6af&q=${year}`);
  const yearResults = yearResultsResponse.data.result.records;
  if (year === 2006) {
    console.log(yearResults);
  }
  return yearResults;
}

async function electionBoundaries(year) {
  const yearBoundariesResponse = await axios.get(`data/electoral-boundary-${year}/electoral-boundary-${year}-kml.geojson`);
  const yearBoundaries = yearBoundariesResponse.data;
  if (year === 2006) {
    yearBoundaries.features.forEach((feature) => {
      feature.properties.ED_DESC = feature.properties.ED_DESC.trim().replace(' - ', '-');
    });
  }
  return yearBoundaries;
}

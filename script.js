/* eslint-disable max-len */
/* eslint-disable no-use-before-define */
const globalLayers = [];
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
    findConstituencies(addressMarker);
    addressMarker.addTo(map);
  });
}

function findConstituencies(addressMarker) {
  console.log(addressMarker);
  console.log(globalLayers);
  const polygon = L.polygon([
    [1, 100, 0],
    [1, 105, 0],
    [1.5, 105, 0],
    [1.5, 100, 0],
  ]);
  console.log(polygon);
  console.log(polygon.contains(addressMarker.getLatLng()));
  globalLayers.forEach((yearLayer) => yearLayer.eachLayer((sublayer) => {
    if (sublayer.contains(addressMarker.getLatLng())) {
      console.log(sublayer.feature.properties);
    }
  }));
}
async function createLayer(year) {
  const layerData = await getYearLayerData(year);
  const yearLayer = L.geoJson(layerData, {
    onEachFeature: (feature, layer) => {
      layer.bindPopup(JSON.stringify(feature.properties.results));
    },
    style: (feature) => {
      let winner = {};
      const { results } = feature.properties;
      if (results.length > 1) {
        feature.properties.results.forEach((result) => {
          winner = result.vote_percentage > 0.5 ? result : winner;
        });
      } else {
        [winner] = results;
        winner.vote_percentage = 1;
      }
      // console.log(winner.party);
      switch (winner.party) {
        case 'PAP': {
          return {
            color: 'blue', // `rgb(${(1 - winner.vote_percentage) * 255}, 0, ${winner.vote_percentage * 255})`,
            fillColor: `rgb(${(1 - winner.vote_percentage) * 255}, 0, ${winner.vote_percentage * 255})`,
            fillOpacity: +winner.vote_percentage * 0.7,
          };
        }
        default: return {
          color: 'red', // `rgb(${(1 - winner.vote_percentage) * 255}, 0, ${winner.vote_percentage * 255})`,
          fillColor: `rgb(${winner.vote_percentage * 255}, 0, ${(1 - winner.vote_percentage) * 255})`,
          fillOpacity: +winner.vote_percentage * 0.7,

        };
      }
    },
  });
  globalLayers.push(yearLayer);
  return yearLayer;
}

async function getYearLayerData(year) {
  const yearResultsReq = electionResults(year);
  const yearBoundariesReq = electionBoundaries(year);

  return Promise.all([yearResultsReq, yearBoundariesReq])
    .then(([yearResultsResponse, yearBoundariesResponse]) => {
      const layerData = yearBoundariesResponse;
      yearBoundariesResponse.features.forEach((feature, idx) => {
        layerData.features[idx].properties.results = yearResultsResponse.filter((result) => result.constituency.toUpperCase() === feature.properties.ED_DESC);
      });
      return layerData;
    });
}

/**
 * requests General election results data from data.gov.sg API
 * @returns {Object} in JSON
 */
async function electionResults(year) {
  const yearResultsResponse = await axios.get(`https://data.gov.sg/api/action/datastore_search?resource_id=4706f2cb-a909-4cc0-bd3d-f366c34cf6af&q=${year}`);
  const yearResults = yearResultsResponse.data.result.records;
  return yearResults;
}

/**
 * reads electoral boundary data for a specific year
 * @returns {Object} in geoJSON format
 */
async function electionBoundaries(year) {
  const yearBoundariesResponse = await axios.get(`data/electoral-boundary-${year}/electoral-boundary-${year}-kml.geojson`);
  const yearBoundaries = yearBoundariesResponse.data;
  return yearBoundaries;
}

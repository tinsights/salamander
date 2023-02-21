window.addEventListener('DOMContentLoaded', async () => {
  const view = initMap();
  const model = await generateModel([2006, 2011, 2015, 2020]);
  addLayersToMap(model, view);
  addPostalSearchEvent(model, view);
});

/**
 * MODEL
 * takes in an array of election years as input,
 * creates an object with year as keys, Leaflet layer element as value.
 *
 */
async function generateModel(years) {
  const layerArr = await Promise.all(years.map((year) => createLayer(year)));
  return Object.fromEntries(years.map((year, idx) => [year, layerArr[idx]]));
}

/**
 * creates a Leaflet Layer object from GeoJSON data
 * layer is an array of polygons that define constituencies
 * relevant election data is contained in properties of each constituency
 * @returns {Object}
 */
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
            fillOpacity: Math.min(winner.vote_percentage, 0.7),
          };
        }
        default: return {
          color: 'red', // `rgb(${(1 - winner.vote_percentage) * 255}, 0, ${winner.vote_percentage * 255})`,
          fillColor: `rgb(${winner.vote_percentage * 255}, 0, ${(1 - winner.vote_percentage) * 255})`,
          fillOpacity: Math.min(winner.vote_percentage, 0.7),

        };
      }
    },
  });
  return yearLayer;
}

async function getYearLayerData(year) {
  const yearResultsReq = getElectionResults(year);
  const yearBoundariesReq = getElectionBoundaries(year);

  return Promise.all([yearResultsReq, yearBoundariesReq])
    .then(([yearResultsResponse, yearBoundariesResponse]) => {
      const layerData = yearBoundariesResponse;
      yearBoundariesResponse.features.forEach((feature, idx) => {
        layerData.features[idx].properties.results = yearResultsResponse.filter((result) => result.constituency.toUpperCase() === feature.properties.ED_DESC);
      });
      return layerData;
    });
}

async function getElectionResults(year) {
  const yearResultsResponse = await axios.get(`https://data.gov.sg/api/action/datastore_search?resource_id=4706f2cb-a909-4cc0-bd3d-f366c34cf6af&q=${year}`);
  const yearResults = yearResultsResponse.data.result.records;
  return yearResults;
}

async function getElectionBoundaries(year) {
  const yearBoundariesResponse = await axios.get(`data/electoral-boundary-${year}/electoral-boundary-${year}-kml.geojson`);
  const yearBoundaries = yearBoundariesResponse.data;
  return yearBoundaries;
}

function initMap() {
  const map = L.map('map').setView([1.3521, 103.8198], 13);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);
  return map;
}

function addLayersToMap(model, view) {
  const baseLayers = model;
  const years = Object.keys(model);
  model[years[years.length - 1]].addTo(view);
  L.control.layers(baseLayers).addTo(view);
  return null;
}

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
  });
}

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

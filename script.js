const CSS_COLOR_NAMES = {
  Crimson: '#d72638',
  'Steel blue': '#3f88c5',
  'Carrot orange': '#f49d37',
  'Dark purple': '#140f2d',
  'Red (CMYK)': '#f22b29',
  'Prussian blue': '#002642',
  Claret: '#840032',
  Gamboge: '#e59500',
  Timberwolf: '#e5dada',
  'Rich black': '#02040f',
  'Dark green': '#042a2b',
  Moonstone: '#5eb1bf',
  'Light cyan': '#cdedf6',
  'Orange (Crayola)': '#ef7b45',
  'Chili red': '#d84727',
  'Prussian blue': '#003049',
  'Fire engine red': '#d62828',
  'Orange (wheel)': '#f77f00',
  Xanthous: '#fcbf49',
  Vanilla: '#eae2b7',
};

window.addEventListener('DOMContentLoaded', async () => {
  const view = initMap();
  // addPostalSearchEvent(model, view);
  const model = await generateModel([2006, 2011, 2015, 2020]);
  console.log(model);
  addLayersToMap(model, view);
});

/**
 * MODEL
 * takes in an array of election years as input,
 * creates an object with year as keys, Leaflet layer element as value.
 *
 */
async function generateModel(years) {
  const newModel = {
    YEARS: years,
    CONSTITUENCIES: {},
  };
  const yearDataReqs = years.map((year) => Promise.all([getElectionResults(year), getElectionBoundaries(year)]));
  return Promise.all(yearDataReqs)
    .then((yearResults) => {
      yearResults.forEach((yearData) => createModel(yearData));
      return newModel;
    });

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

  function createModel([yearResults, yearBoundaries]) {
    const { year } = yearResults[0];
    yearBoundaries.features.forEach((feature) => {
    // if new constituency,
    // create a new key in model
    // add results and boundaries of current year
      const currConstituency = feature.properties.ED_DESC;
      if (!newModel.CONSTITUENCIES[currConstituency]) {
        const randColor = randomColor();
        newModel.CONSTITUENCIES[currConstituency] = {
          style: { color: randColor },
        };
      }
      // else if constituency already exists, add
      newModel.CONSTITUENCIES[currConstituency][year] = {
        results: {},
        boundaries: {},
      };
      newModel.CONSTITUENCIES[currConstituency][year].results = yearResults.filter((result) => result.constituency.toUpperCase() === currConstituency);
      newModel.CONSTITUENCIES[currConstituency][year].boundaries = yearBoundaries.features.filter((boundary) => boundary.properties.ED_DESC === currConstituency);
    });
  }
  function randomColor() {
    return Object.values(CSS_COLOR_NAMES).splice(Math.round(Math.random() * Object.keys(CSS_COLOR_NAMES).length), 1)[0];
  }
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

function initMap() {
  const map = L.map('map').setView([1.3521, 103.8198], 13);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);
  return map;
}

function addLayersToMap(model, view) {
  const yearLayers = newCreateLayer(model);

  const years = Object.keys(yearLayers);
  L.control.timelineSlider({
    timelineItems: years,
    extraChangeMapParams: { yearLayers },
    changeMap: timelineFunction,
    position: 'bottomleft',
  })
    .addTo(view);
  return null;

  function newCreateLayer(m) {
    const results = {};
    m.YEARS.forEach((year) => {
      const yearLayer = L.featureGroup();
      Object.values(m.CONSTITUENCIES).forEach((constituency) => {
        if (constituency[year]) {
          L.geoJSON(constituency[year].boundaries, {
            style: constituency.style,
          }).addTo(yearLayer);
          // console.log(constituency.style);
        }
      });
      results[year] = yearLayer;
    });
    return results;
  }
  function timelineFunction({
    label, value, map, yearLayers,
  }) {
    Object.keys(yearLayers).forEach((year) => {
      map.removeLayer(yearLayers[year]);
    });
    yearLayers[label].addTo(map);
  }
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

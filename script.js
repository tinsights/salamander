const CSS_COLOR_NAMES = [
  '#d72638',
  '#3f88c5',
  '#f49d37',
  '#140f2d',
  '#f22b29',
  '#002642',
  '#840032',
  '#e59500',
  '#02040f',
  '#042a2b',
  '#5eb1bf',
  '#ef7b45',
  '#d84727',
  '#003049',
  '#d62828',
  '#f77f00',
  '#fcbf49',
  'darkorange',
  'darkblue',
  'greenyellow',
  'darkgoldenrod',
  'steelblue',
  'magenta',
  'chartreuse',
  'turqoise',
  'crimson',
  'Maroon',
  'MediumBlue',
  'SeaGreen',
  'GreenYellow',
  'Purple',
  'darkorange',
  'darkblue',
  'greenyellow',
  'darkgoldenrod',
  'steelblue',
  'magenta',
  'chartreuse',
  'turqoise',
  'crimson',
  'Maroon',
  'MediumBlue',
  'SeaGreen',
  'GreenYellow',
  'Purple',

];

window.addEventListener('DOMContentLoaded', async () => {
  const map = initMap();

  // addPostalSearchEvent(model, view);
  const model = await generateModel([2006, 2011, 2015, 2020]);
  const layers = createLayers(model);
  const view = {
    map,
    layers,
  };
  console.log(model);
  addLayersToMap(model, view);
  // toggleButton(model, view);
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
      const currConstituency = feature.properties.ED_DESC;
      const constituencyResults = yearResults.filter((result) => result.constituency.toUpperCase() === currConstituency);
      const constituencyBoundaries = yearBoundaries.features.filter((boundary) => boundary.properties.ED_DESC === currConstituency);
      const constituencyStyle = generateConstituencyStyle(constituencyResults);
      // if new constituency,
      // create a new key in model
      // add results and boundaries of current year
      if (!newModel.CONSTITUENCIES[currConstituency]) {
        newModel.CONSTITUENCIES[currConstituency] = {
          boundaryColor: boundaryColorGenerator(),
        };
      }
      // else if constituency already exists, add
      constituencyStyle.color = newModel.CONSTITUENCIES[currConstituency].boundaryColor;
      newModel.CONSTITUENCIES[currConstituency][year] = {
        results: {},
        boundaries: {},
        style: constituencyStyle,
      };
      newModel.CONSTITUENCIES[currConstituency][year].results = constituencyResults;
      newModel.CONSTITUENCIES[currConstituency][year].boundaries = constituencyBoundaries;
    });
  }

  function generateConstituencyStyle(constituencyResults) {
    // console.log(constituencyResults);
    let winner = {};
    if (constituencyResults.length > 1) {
      constituencyResults.forEach((result) => {
        winner = result.vote_percentage > 0.5 ? result : winner;
      });
    } else {
      [winner] = constituencyResults;
      winner.vote_percentage = 1;
    }
    switch (winner.party) {
      case 'PAP': {
        return {
          fillColor: `rgb(${(1 - winner.vote_percentage) * 255}, 0, ${winner.vote_percentage * 255})`,
          fillOpacity: Math.min(winner.vote_percentage, 0.7),
        };
      }
      default: return {
        fillColor: `rgb(${winner.vote_percentage * 255}, 0, ${(1 - winner.vote_percentage) * 255})`,
        fillOpacity: Math.min(winner.vote_percentage, 0.7),

      };
    }
  }
  function boundaryColorGenerator() {
    return CSS_COLOR_NAMES.splice(1, 1);
  }
}

/**
 * creates a Leaflet Layer object from GeoJSON data
 * layer is an array of polygons that define constituencies
 * relevant election data is contained in properties of each constituency
 * @returns {Object}
 */

function initMap() {
  const map = L.map('map').setView([1.3521, 103.8198], 13);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);
  return map;
}

function addLayersToMap(model, view) {
  const years = Object.keys(view.layers);
  L.control.timelineSlider({
    timelineItems: years,
    extraChangeMapParams: view.layers,
    changeMap: timelineFunction,
    position: 'bottomleft',
  })
    .addTo(view.map);
  return null;
  function timelineFunction({
    label,
  }) {
    Object.values(view.layers).forEach((layer) => {
      view.map.removeLayer(layer);
    });
    view.layers[label].addTo(view.map);
  }
}
function createLayers(model) {
  const results = {};
  model.YEARS.forEach((year) => {
    const yearLayer = L.featureGroup();
    Object.values(model.CONSTITUENCIES).forEach((constituency) => {
      if (constituency[year]) {
        L.geoJSON(constituency[year].boundaries, {
          style: constituency[year].style,
        }).bindPopup(JSON.stringify(
          {
            constituency: constituency[year].boundaries[0].properties.ED_DESC,
          },
        )).addTo(yearLayer);
        // console.log(constituency.style);
      }
    });
    results[year] = yearLayer;
  });
  return results;
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

function initView() {
  const map = L.map('map').setView([1.3521, 103.8198], 13);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);
  const activeLayer = L.geoJSON().addTo(map);
  const view = {
    map,
    activeLayer,
    layers: {},
  };
  return view;
}

function addLayersToMap(model, view) {
  const years = model.YEARS;
  years.forEach((year) => createLayer(model, year));
  // console.log(view);
  L.control.timelineSlider({
    timelineItems: years,
    extraChangeMapParams: { model, view },
    changeMap: timelineFunction,
    position: 'bottomleft',
  })
    .addTo(view.map);
  return null;
}
function timelineFunction({ label, model, view }) {
  console.log(label, model, view);
  Object.values(view.layers).forEach((layer) => view.map.removeLayer(layer));
  view.layers[label].addTo(view.map);
  const associateYearLayer = Object.values(model.CONSTITUENCIES)
    .map((constituency) => constituency[label])
    .filter((e) => e !== undefined)
    .forEach((constituency) => {
      constituency.feature.setStyle(constituency.style.resultStyle);
    });
  console.log(associateYearLayer);
}

function createLayer(model, year) {
  const yearLayer = L.layerGroup();
  Object.values(model.CONSTITUENCIES).forEach((constituency) => {
    if (constituency[year]) {
      const geo = L.geoJSON(constituency[year].boundaries, {
        // style: constituency[year].style,
      }).bindPopup(JSON.stringify(
        {
          constituency: constituency[year].boundaries[0].properties.ED_DESC,
        },
      ));
      constituency[year].feature = geo;
      geo.addTo(yearLayer);
    }
  });
  view.layers[year] = yearLayer;
  return yearLayer;
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
        color: 'darkblue',
        fillColor: `rgb(${(1 - winner.vote_percentage) * 255}, 0, ${winner.vote_percentage * 255})`,
        fillOpacity: Math.min(winner.vote_percentage, 0.7),
      };
    }
    default: return {
      color: 'darkred',
      fillColor: `rgb(${winner.vote_percentage * 255}, 0, ${(1 - winner.vote_percentage) * 255})`,
      fillOpacity: Math.min(winner.vote_percentage, 0.7),

    };
  }
}
function boundaryColorGenerator() {
  return CSS_COLOR_NAMES.splice(1, 1)[0];
}

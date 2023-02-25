function initView() {
  const map = L.map('map').setView([1.3521, 103.8198], 12);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);
  const view = {
    map,
    layers: {},
    currentStyle: 'defaultStyle',
  };
  return view;
}

function addLayersToMap(model, view) {
  const years = Object.keys(model);
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
  // console.log(label, model, view);
  Object.values(view.layers).forEach((layer) => view.map.removeLayer(layer));
  view.layers[label].addTo(view.map);
  const constituencies = model[label].CONSTITUENCIES;

  setView(constituencies, view.currentStyle);
}
function setView(constituencies, option = 'defaultStyle') {
  Object.values(constituencies).forEach((constituency) => {
    constituency.feature.setStyle(constituency.style[option]);
  });
}
function createLayer(model, year) {
  const yearLayer = L.layerGroup();
  Object.values(model[year].CONSTITUENCIES).forEach((constituency) => {
    const geo = L.geoJSON(constituency.boundaries, {
      // style: constituency[year].style,
    }).bindPopup(JSON.stringify(
      {
        constituency: constituency.boundaries.properties,
      },
    ));
    constituency.feature = geo;
    geo.addTo(yearLayer);
  });
  view.layers[year] = yearLayer;
  return yearLayer;
}

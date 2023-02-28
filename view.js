function initView() {
  const map = L.map('map').setView([1.3521, 103.8198], 11);
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
  const yearLayer = L.featureGroup();
  Object.values(model[year].CONSTITUENCIES).forEach((constituency) => {
    const geo = L.geoJSON(constituency.boundaries, {
      onEachFeature: (feature, layer) => {
        layer.bindPopup(createPopup(constituency), {
          maxWidth: 'max-content',
        });
      },
    });
    constituency.feature = geo;
    geo.addTo(yearLayer);
  });
  view.layers[year] = yearLayer;
  return yearLayer;
}

function createPopup(constituency) {
  const { results } = constituency;
  const resultsDiv = document.createElement('div');
  resultsDiv.classList = 'row';
  const cardColSz = 12 / results.length;
  results.forEach((result) => {
    const partyCard = document.createElement('div');
    partyCard.classList.add('card', 'party-card');

    const partyImg = document.createElement('img');
    partyImg.src = partyImage(result.party);
    partyImg.classList.add('card-img-top');

    const cardBody = document.createElement('div');
    const partyTitle = document.createElement('h5');
    partyTitle.innerText = result.party;
    partyTitle.classList.add('card-title', 'text-center');
    cardBody.classList.add('card-body', 'px-0');

    const candidatesList = document.createElement('ul');
    candidatesList.classList.add('list-group', 'text-center');
    result.candidates.split(' | ').forEach((candidate) => {
      const listItem = document.createElement('li');
      listItem.classList.add('list-group-item');
      listItem.innerHTML = `<span>${candidate}</span>`;
      candidatesList.appendChild(listItem);
    });
    cardBody.appendChild(candidatesList);
    // cardBody.innerHTML += JSON.stringify(result.vote_percentage);

    partyCard.appendChild(partyImg);
    partyCard.appendChild(partyTitle);
    partyCard.appendChild(cardBody);
    resultsDiv.appendChild(partyCard);
  });

  return resultsDiv;
}

function partyImage(party) {
  switch (party) {
    case 'SUP':
    case 'PSP':
    case 'DPP':
    case 'INDP':
      return `assets/${party}_logo.png`;
    default:
      return `assets/${party}_logo.svg`;
  }
}

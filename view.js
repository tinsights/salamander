function initView() {
  const initialHeight = window.innerWidth > 768 ? 11 : 10;
  console.log(window.innerWidth);
  console.log(initialHeight);
  const map = L.map('map').setView([1.3521, 103.8198], initialHeight);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);
  // map.on('contextmenu', async (e) => {
  //   await axios.get(`https://developers.onemap.sg/privateapi/commonsvc/revgeocode?location=${e.latlng.lat},${e.latlng.lng}&token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjk4NjksInVzZXJfaWQiOjk4NjksImVtYWlsIjoiYWoudGluYWVzQGdtYWlsLmNvbSIsImZvcmV2ZXIiOmZhbHNlLCJpc3MiOiJodHRwOlwvXC9vbTIuZGZlLm9uZW1hcC5zZ1wvYXBpXC92MlwvdXNlclwvc2Vzc2lvbiIsImlhdCI6MTY3NzU4NjU5NiwiZXhwIjoxNjc4MDE4NTk2LCJuYmYiOjE2Nzc1ODY1OTYsImp0aSI6Ijc3ZjhkMmE5ZDNmZjE2MzEzMWY2ZjMwYmRjMTExZWVkIn0.2VJ2n7IrXIRdahXm7n23kJRaxAms_IsUbAayNVN1YWA&buffer=20&addressType=All&otherFeatures=N`).then((result) => {
  //     if (result.data.GeocodeInfo) {
  //       map.openTooltip(String(result.data.GeocodeInfo[0].POSTALCODE), e.latlng);
  //     }
  //   });
  // });
  const view = {
    map,
    layers: {},
    currentStyle: 'defaultStyle',
  };
  return view;
}

function addLayersToMap(model, view) {
  const years = Object.keys(model);
  years.forEach((year) => createLayer(model, view, year));
  // console.log(view);
  L.control
    .timelineSlider({
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
function createLayer(model, view, year) {
  const yearLayer = L.featureGroup();
  Object.entries(model[year].CONSTITUENCIES).forEach(([constituencyName, constituencyData]) => {
    const geo = L.geoJSON(constituencyData.boundaries, {
      onEachFeature: (feature, layer) => {
        layer.bindPopup(createPopup(constituencyData), {
          maxWidth: 'fit-content',
        });
        console.log(window.innerWidth);
        if (window.innerWidth > 768) {
          layer.bindTooltip(`<h6 class="h6">${constituencyName}</h6>`, {
            sticky: true,
          });
        }
        // layer.on('click', () => layer.closeToolTip());
      },
    });
    constituencyData.feature = geo;
    geo.addTo(yearLayer);
  });
  view.layers[year] = yearLayer;
  return yearLayer;
}

function createPopup(constituency) {
  const { results } = constituency;

  const popup = document.createElement('div');
  popup.classList.add('container');
  const resultsDiv = document.createElement('div');
  resultsDiv.classList.add('row', 'gx-3', 'flex-nowrap');
  const constInfo = document.createElement('div');
  constInfo.classList.add('container', 'text-center');
  constInfo.innerHTML = `<h5 class="h5">${results[0].constituency} ${results[0].constituency_type}</h5>`;
  popup.appendChild(constInfo);
  results.forEach((result) => {
    const partyCol = document.createElement('div');
    partyCol.classList.add('col', 'flip-card');

    const flipCardInner = document.createElement('div');
    flipCardInner.classList.add('flip-card-inner');

    const partyCard = document.createElement('div');
    partyCard.classList.add(
      'flip-card-front',
      'py-1',
      'px-3',
      'text-center',
      'd-flex',
      'flex-column',
      'justify-content-center',
    );

    const partyImg = document.createElement('img');
    partyImg.src = partyImage(result.party);
    partyImg.classList.add('logo');

    const cardBody = document.createElement('p');
    cardBody.classList.add('fw-bold');
    const partyTitle = document.createElement('h6');
    partyTitle.innerText = result.party;
    partyTitle.classList.add('text-center', 'h6');
    cardBody.classList.add('px-0');
    const voteShare = Number(result.vote_percentage);

    // cardBody.innerHTML = `${(voteShare * 100).toFixed(2)}%`;
    cardBody.appendChild(createDonut(result.vote_count, result.vote_percentage, result.party));

    const candidatesCard = document.createElement('div');
    candidatesCard.classList.add('flip-card-back', 'd-flex', 'flex-column', 'justify-content-center');
    const candidatesList = document.createElement('ul');
    candidatesList.classList.add('list-group', 'text-center');
    result.candidates.split(' | ').forEach((candidate) => {
      const listItem = document.createElement('li');
      listItem.classList.add('list-group-item', 'p-1');
      listItem.innerHTML = `${candidate}`;
      candidatesList.appendChild(listItem);
    });

    if (voteShare > 0.5) {
      partyCard.classList.add('border', 'border-success');
      candidatesCard.classList.add('border', 'border-success');
      cardBody.classList.add('text-success');
    } else {
      partyCard.classList.add('border', 'border-danger');
      candidatesCard.classList.add('border', 'border-danger');
      cardBody.classList.add('text-danger');
    }
    candidatesCard.appendChild(candidatesList);

    partyCard.addEventListener('click', () => {
      partyCard.classList.add('flip-backwards');
      candidatesCard.classList.add('flip-forwards');
      setTimeout(() => {
        partyCard.classList.add('flip-card-back');
        partyCard.classList.remove('flip-card-front', 'flip-backwards');
        candidatesCard.classList.add('flip-card-front');
        candidatesCard.classList.remove('flip-card-back', 'flip-forwards');
      }, 1000);
    });

    candidatesCard.addEventListener('click', () => {
      partyCard.classList.add('flip-forwards');
      candidatesCard.classList.add('flip-backwards');
      setTimeout(() => {
        candidatesCard.classList.add('flip-card-back');
        candidatesCard.classList.remove('flip-card-front', 'flip-backwards');
        partyCard.classList.add('flip-card-front');
        partyCard.classList.remove('flip-card-back', 'flip-forwards');
      }, 1000);
    });

    partyCard.appendChild(partyImg);
    partyCard.appendChild(partyTitle);
    partyCard.appendChild(cardBody);
    flipCardInner.appendChild(partyCard);
    flipCardInner.appendChild(candidatesCard);
    partyCol.appendChild(flipCardInner);
    resultsDiv.appendChild(partyCol);
  });
  popup.appendChild(resultsDiv);
  return popup;
}

function partyImage(party) {
  switch (party) {
    case 'INDP':
    case 'Independent':
      return 'assets/INDP_logo.png';
    case 'SUP':
    case 'PSP':
    case 'DPP':
      return `assets/${party}_logo.png`;
    default:
      return `assets/${party}_logo.svg`;
  }
}

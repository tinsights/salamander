import { getHistory } from "./controllers.js";

export function initView() {
  addLoadingScreen();
  const initialHeight = window.innerWidth > 768 ? 11 : 10;
  const map = L.map("map", {
    contextmenu: true,
    contextmenuWidth: 140,
    contextmenuItems: [
      {
        text: "Inspect History",
        icon: "assets/question-square.svg",
        callback: addMarker,
      },
      {
        text: "Center map here",
        icon: "assets/bounding-box-circles.svg",
        callback: centerMap,
      },
      "-",
      {
        text: "Zoom in",
        icon: "assets/zoom-in.svg",
        callback: zoomIn,
      },
      {
        text: "Zoom out",
        icon: "assets/zoom-out.svg",
        callback: zoomOut,
      },
    ],
  });
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    // dark mode
    L.tileLayer(
      "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png?api_key=c3729d13-ca73-4104-9eb9-c90c6eb68aff",
      {
        maxZoom: 20,
        // attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
      }
    ).addTo(map);
  } else {
    L.tileLayer(
      "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png?api_key=c3729d13-ca73-4104-9eb9-c90c6eb68aff",
      {
        maxZoom: 20,
        // attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
      }
    ).addTo(map);
  }

  map.setView([1.38, 103.85], initialHeight);
  const markers = L.layerGroup().addTo(map);
  const view = {
    map,
    layers: {},
    markers,
    currentStyle: "defaultStyle",
  };

  return view;

  async function addMarker(e) {
    const { latlng } = e;
    console.log(latlng);
    const token = await axios.get("https://psychic-couscous.onrender.com/onemaptoken");
    const address = axios.get(
      `https://developers.onemap.sg/privateapi/commonsvc/revgeocode?location=${latlng.lat}%2C${latlng.lng}&token=${token.data}&buffer=500&addressType=All&otherFeatures=N`
    );
    const addressMarker = L.marker(e.latlng);
    const { layers } = view;
    const history = getHistory(layers, e.latlng);
    addressMarker.bindPopup(history);
    addressMarker.addTo(view.markers);
    view.map.flyTo([latlng.lat + 0.05, latlng.lng], 13);
    await address.then((result) => {
      const titleEl = document.createElement("h3");
      let name = "Address Not Found";
      if (result.data.GeocodeInfo.length) {
        const place = result.data.GeocodeInfo[0];
        console.log(place);
        name = place.ROAD === "NIL" ? place.BUILDINGNAME : place.ROAD;
      }
      titleEl.classList.add("lead", "text-center");
      titleEl.innerHTML = name;
      history.insertBefore(titleEl, history.firstChild);
    });
    addressMarker.openPopup();
  }
  function centerMap(e) {
    map.panTo(e.latlng);
  }

  function zoomIn(e) {
    map.zoomIn();
  }

  function zoomOut(e) {
    map.zoomOut();
  }
}

function addLoadingScreen() {
  const mapContainer = document.getElementById("map");
  let el = document.createElement("div");
  el.innerHTML = `<div id="loading" style="width: 100%;height: 100%;background-color: rgba(0,0,0,0.5);position: absolute;z-index: 10000;" class="d-flex justify-content-center align-items-center"><div class="spinner-border text-light" role="status" style="
    margin: auto;
"></div></div>`;
  el = el.firstChild;
  mapContainer.insertBefore(el, mapContainer.firstChild);
}
export function removeLoadingScreen() {
  const el = document.getElementById("loading");
  el.remove();
}

export function addLayersToMap(model, view) {
  const years = Object.keys(model);
  years.forEach((year) => createLayer(model, view, year));
  // console.log(view);
  L.control
    .timelineSlider({
      timelineItems: years,
      extraChangeMapParams: { model, view },
      changeMap: timelineFunction,
      position: "bottomright",
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
export function setView(constituencies, option = "defaultStyle") {
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
          maxWidth: "fit-content",
          autoPanPadding: L.point(50, 50),
        });
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
  const popup = document.createElement("div");
  popup.classList.add("container");
  const resultsDiv = document.createElement("div");
  resultsDiv.classList.add("row", "gx-3", "flex-nowrap");
  const constInfo = document.createElement("div");
  constInfo.classList.add("text-center");
  constInfo.innerHTML = `<h3 class="grc-name">${results[0].constituency} ${results[0].constituency_type}</h3>`;
  popup.appendChild(constInfo);
  results.forEach((result) => {
    const partyCol = document.createElement("div");
    partyCol.classList.add("col", "flip-card");

    const flipCardInner = document.createElement("div");
    flipCardInner.classList.add("flip-card-inner");

    const partyCard = document.createElement("div");
    partyCard.classList.add(
      "flip-card-front",
      "py-1",
      "px-3",
      "text-center",
      "d-flex",
      "flex-column",
      "justify-content-center"
    );

    const partyImg = document.createElement("img");
    partyImg.src = partyImage(result.party);
    partyImg.classList.add("logo");

    const cardBody = document.createElement("p");
    cardBody.classList.add("fw-bold");
    const partyTitle = document.createElement("h6");
    partyTitle.innerText = result.party;
    partyTitle.classList.add("text-center", "h6");
    cardBody.classList.add("px-0");
    const voteShare = Number(result.vote_percentage);

    cardBody.innerHTML = `${(voteShare * 100).toFixed(2)}%`;

    const candidatesCard = document.createElement("div");
    candidatesCard.classList.add("flip-card-back", "d-flex", "flex-column", "justify-content-center");
    const candidatesList = document.createElement("ul");
    candidatesList.classList.add("list-group", "text-center");
    result.candidates.split(" | ").forEach((candidate) => {
      const listItem = document.createElement("li");
      listItem.classList.add("list-group-item", "p-1");
      listItem.innerHTML = `${candidate}`;
      candidatesList.appendChild(listItem);
    });

    if (voteShare > 0.5) {
      partyCard.classList.add("winner-card-border");
      candidatesCard.classList.add("winner-card-border");
      cardBody.classList.add("text-success");
    } else {
      partyCard.classList.add("loser-card-border");
      candidatesCard.classList.add("loser-card-border");
      cardBody.classList.add("text-danger");
    }
    candidatesCard.appendChild(candidatesList);

    partyCard.addEventListener("click", () => {
      partyCard.classList.add("flip-backwards");
      candidatesCard.classList.add("flip-forwards");
      setTimeout(() => {
        partyCard.classList.add("flip-card-back");
        partyCard.classList.remove("flip-card-front", "flip-backwards");
        candidatesCard.classList.add("flip-card-front");
        candidatesCard.classList.remove("flip-card-back", "flip-forwards");
      }, 1000);
    });

    candidatesCard.addEventListener("click", () => {
      partyCard.classList.add("flip-forwards");
      candidatesCard.classList.add("flip-backwards");
      setTimeout(() => {
        candidatesCard.classList.add("flip-card-back");
        candidatesCard.classList.remove("flip-card-front", "flip-backwards");
        partyCard.classList.add("flip-card-front");
        partyCard.classList.remove("flip-card-back", "flip-forwards");
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
    case "INDP":
    case "Independent":
      return "assets/INDP_logo.png";
    case "SUP":
    case "PSP":
    case "DPP":
      return `assets/${party}_logo.png`;
    default:
      return `assets/${party}_logo.svg`;
  }
}

export function showControls() {
  document.querySelector("#mobile-menu-container").classList.remove("d-none");
  const timecontrols = document.querySelector(".control_container");
  timecontrols.style.display = "inline-block";
}

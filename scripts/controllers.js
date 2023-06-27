import { setView } from "./view.js";

export function addToggleButton(model, view) {
  const toggleBtn = document.getElementById("toggleBtn");

  function toggleView() {
    view.currentStyle = view.currentStyle === "defaultStyle" ? "resultStyle" : "defaultStyle";
    Object.values(model).forEach((year) => {
      setView(year.CONSTITUENCIES, view.currentStyle);
    });
  }

  toggleBtn.addEventListener("click", toggleView);
}

export async function addPostalSearchEvent(view) {
  const postalCodeBtn = document.getElementById("postalCodeBtn");
  postalCodeBtn.addEventListener("click", async () => {
    const address = await axios.get(
      `https://developers.onemap.sg/commonapi/search?searchVal=${postalCodeSelector.value}&returnGeom=Y&getAddrDetails=N`
    );
    const title = document.createElement("h6");
    title.classList.add("lead", "text-center");
    title.innerHTML = `${address.data.results[0].SEARCHVAL}`;
    const coordinates = address.data.results[0];
    const point = {
      lat: coordinates.LATITUDE,
      lng: coordinates.LONGITUDE,
    };
    const addressMarker = L.marker([point.lat, point.lng]);
    const { layers } = view;
    const history = getHistory(layers, point);
    history.insertBefore(title, history.firstChild);
    addressMarker.bindPopup(history, { maxWidth: "fit-content" });
    addressMarker.addTo(view.markers);
    const flyLat = +point.lat + 0.015;
    view.map.flyTo([flyLat, point.lng], 12);
    addressMarker.openPopup();
  });
}

export function getHistory(mapLayers, point) {
  const container = document.createElement("div");
  container.classList.add("container", "year-history-card");
  const constHist = [];
  Object.entries(mapLayers).forEach(([year, yearLayer]) =>
    yearLayer.eachLayer((geojsonLayer) => {
      geojsonLayer.eachLayer((polygon) => {
        if (polygon.contains(point)) {
          const constituency = polygon.feature.properties.ED_DESC;
          const row = document.createElement("div");
          row.classList.add("const-hist", "row", "my-1", "gx-0", "border", "border-3", "rounded-3");
          row.style.cssText += `border-color: ${allConstituencies[constituency].defaultStyle.fillColor} !important;`;
          const yearCol = document.createElement("div");
          yearCol.classList.add("col-4", "text-center");
          yearCol.innerHTML = `<p><strong>${year}: </strong></p>`;
          const grcCol = document.createElement("div");
          grcCol.classList.add("col-8", "text-center");
          grcCol.innerHTML = `<p>${constituency}</p>`;
          constHist.push(constituency);
          row.append(yearCol, grcCol);
          container.append(row);
        }
      });
    })
  );
  switch (calcChangesInHistory(constHist)) {
    case 2:
      score += 1;
      break;
    case 3:
      score += 2;
      break;
    case 0:
    default:
      break;
  }
  return container;
}

export function calcChangesInHistory(constHist) {
  let changes = 0;
  for (let i = 1; i < constHist.length; i++) {
    if (constHist[i] !== constHist[i - 1]) {
      changes += 1;
    }
  }
  return changes;
}

export function clearMarkersButton(view) {
  const clearButton = document.getElementById("clearBtn");
  const initialHeight = window.innerWidth > 768 ? 11 : 10;

  clearButton.addEventListener("click", () => {
    view.markers.clearLayers();
    view.map.flyTo([1.38, 103.85], initialHeight);
  });
}

export function darkmodeWatcher(view) {
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (event) => {
    const colorScheme = event.matches ? "dark" : "light";
    switch (colorScheme) {
      case "dark":
        L.tileLayer(
          "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png?api_key=c3729d13-ca73-4104-9eb9-c90c6eb68aff",
          {
            maxZoom: 20,
            // attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
          }
        ).addTo(view.map);
        break;

      case "light":
      default:
        L.tileLayer(
          "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png?api_key=c3729d13-ca73-4104-9eb9-c90c6eb68aff",
          {
            maxZoom: 20,
            // attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
          }
        ).addTo(view.map);
        break;
    }
  });
}

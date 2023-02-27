let view = {};
let model = {};
const allConstituencies = {};
window.addEventListener('DOMContentLoaded', async () => {
  view = initView();
  // addPostalSearchEvent(model, view);
  model = await generateModel([2006, 2011, 2015, 2020]);
  console.log(model);
  addLayersToMap(model, view);

  // CHART
  const labels = Object.keys(model);

  const parties = {};
  labels.forEach((year, idx) => {
    Object.entries(model[year].RESULTS).forEach(([party, votes]) => {
      party = party === 'Independent' ? 'INDP' : party;
      if (!parties[party]) {
        parties[party] = {
          label: party,
          data: Array(4).fill(0),
          stack: 'Stack 0',
        };
      }
      parties[party].data[idx] = votes.totalVotes;
      if (party === 'PAP') {
        parties[party].stack = 'Stack 1';
      }
    });
  });
  const datasets = Object.values(parties);
  console.log(parties);

  const data = {
    labels,
    datasets,
  };

  const config = {
    type: 'bar',
    data,
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Chart.js Bar Chart - Stacked',
        },
      },
      responsive: true,
      interaction: {
        intersect: false,
      },
      scales: {
        x: {
          stacked: true,
        },
        y: {
          stacked: true,
        },
      },
    },
  };

  const ctx = document.getElementById('myChart');

  const chart = new Chart(ctx, config);
});

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

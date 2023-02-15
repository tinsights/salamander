window.addEventListener('DOMContentLoaded', async () => {
  const map = L.map('map').setView([1.3521, 103.8198], 13);

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  const test = await axios.get('data/electoral-boundary-2006/electoral-boundary-2006-geojson.geojson');
  console.log(test.data);
  const testLayer = L.geoJson(test.data).addTo(map);
});

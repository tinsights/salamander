window.addEventListener('DOMContentLoaded', async () => {
  const map = L.map('map').setView([1.3521, 103.8198], 13);

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  const twoThousandSix = await axios.get('data/electoral-boundary-2006/electoral-boundary-2006-geojson.geojson');
  const twoThousandSixLayer = L.geoJson(twoThousandSix.data).addTo(map);

  const twoThousandEleven = await axios.get('data/electoral-boundary-2011/electoral-boundary-2011-geojson.geojson');
  const twoThousandElevenLayer = L.geoJson(twoThousandEleven.data).addTo(map);

  const twentyFifteen = await axios.get('data/electoral-boundary-2015/electoral-boundary-2015-geojson.geojson');
  const twentyFifteenLayer = L.geoJson(twentyFifteen.data).addTo(map);

  const twentyTwenty = await axios.get('data/electoral-boundary_2020/doc.kml');
  console.log(twentyTwenty);
  const parser = new DOMParser();
  const kml = parser.parseFromString(twentyTwenty.data, 'text/xml');
  const boundaries = new L.KML(kml);
  const twentyTwentyLayer = L.layerGroup();
  boundaries.addTo(twentyTwentyLayer);
  twentyTwentyLayer.addTo(map);
  // const twentyTwentyLayer = L.geoJson(twentyTwenty.data).addTo(map);

  const baseLayers = {
    2006: twoThousandSixLayer,
    2011: twoThousandElevenLayer,
    2015: twentyFifteenLayer,
    2020: twentyTwentyLayer,
  };

  const overlays = {
  };
  L.control.layers(baseLayers, overlays).addTo(map);
});

import { kml } from 'https://unpkg.com/@tmcw/togeojson?module';

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
  console.log(twentyFifteen.data);
  const twentyFifteenLayer = L.geoJson(twentyFifteen.data).addTo(map);

  const twentyTwentyKML = await axios.get('data/electoral-boundary_2020/doc.kml');
  const parser = new DOMParser();
  const KMLdata = parser.parseFromString(twentyTwentyKML.data, 'text/xml');
  const twentyTwenty = new L.KML(KMLdata);
  console.log(twentyTwenty);
  const twentyTwentyKMLLayer = L.layerGroup();
  twentyTwenty.addTo(twentyTwentyKMLLayer);
  twentyTwentyKMLLayer.addTo(map);

  const twentyTwentyGEOJson = kml(KMLdata);
  console.log(twentyTwentyGEOJson);
  const twentyTwentyGEOJsonLayer = L.geoJson(twentyTwentyGEOJson).addTo(map);

  const baseLayers = {
    2006: twoThousandSixLayer,
    2011: twoThousandElevenLayer,
    2015: twentyFifteenLayer,
    2020: twentyTwentyKMLLayer,
    2021: twentyTwentyGEOJsonLayer,
  };

  const overlays = {
  };
  L.control.layers(baseLayers, overlays).addTo(map);
});

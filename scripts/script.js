import createChart from './chart.js';
import { addToggleButton, addPostalSearchEvent } from './controllers.js';
import { initView, addLayersToMap, removeLoadingScreen } from './view.js';
import generateModel from './model.js';

window.addEventListener('DOMContentLoaded', async () => {
  const view = initView();
  generateModel([2006, 2011, 2015, 2020]).then((model) => {
    removeLoadingScreen();
    console.log(model);
    addPostalSearchEvent(model, view);
    addLayersToMap(model, view);
    addToggleButton(model, view);
    createChart(model);

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
      const colorScheme = event.matches ? 'dark' : 'light';
      switch (colorScheme) {
        case 'dark':
          L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
            maxZoom: 20,
            attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
          }).addTo(view.map);
          break;
        case 'light':
          L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
            maxZoom: 20,
            attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
          }).addTo(view.map);
          break;
        default:
          break;
      }
    });
  });
});

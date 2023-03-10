import generateModel from './model.js';
import {
  initView, addLayersToMap, removeLoadingScreen, showControls,
} from './view.js';
import {
  addToggleButton, addPostalSearchEvent, darkmodeWatcher, clearMarkersButton,
} from './controllers.js';
import createChart from './chart.js';

window.addEventListener('DOMContentLoaded', async () => {
  const view = initView();
  generateModel([2006, 2011, 2015, 2020]).then((model) => {
    removeLoadingScreen();
    addPostalSearchEvent(view);
    addLayersToMap(model, view);
    showControls();
    addToggleButton(model, view);
    clearMarkersButton(view);
    createChart(model);
    darkmodeWatcher(view);
  });
});

import generateModel from './model.js';
import { initView, addLayersToMap, removeLoadingScreen } from './view.js';
import { addToggleButton, addPostalSearchEvent, darkmodeWatcher } from './controllers.js';
import createChart from './chart.js';

window.addEventListener('DOMContentLoaded', async () => {
  const view = initView();
  generateModel([2006, 2011, 2015, 2020]).then((model) => {
    removeLoadingScreen();
    console.log(model);
    console.log(view);
    addPostalSearchEvent(model, view);
    addLayersToMap(model, view);
    addToggleButton(model, view);
    createChart(model);
    darkmodeWatcher(view);
  });
});

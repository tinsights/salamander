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
  });
});

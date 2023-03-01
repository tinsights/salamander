import createChart from './chart.mjs';
import { addToggleButton, addPostalSearchEvent } from './controllers.mjs';
import { initView, addLayersToMap } from './view.mjs';
import generateModel from './model.mjs';

window.addEventListener('DOMContentLoaded', async () => {
  const view = initView();
  generateModel([2006, 2011, 2015, 2020]).then((model) => {
    console.log(model);
    addPostalSearchEvent(model, view);
    addLayersToMap(model, view);
    addToggleButton(model, view);
    createChart(model);
  });
});

import generateModel from "./model.js";
import { initView, addLayersToMap, removeLoadingScreen, showControls } from "./view.js";
import { addToggleButton, addPostalSearchEvent, darkmodeWatcher, clearMarkersButton } from "./controllers.js";
import createChart from "./chart.js";

window.addEventListener("DOMContentLoaded", async () => {
  const view = initView();
  generateModel([2006, 2011, 2015, 2020]).then((model) => {
    removeLoadingScreen();
    addPostalSearchEvent(view);
    addLayersToMap(model, view);
    showControls();
    addToggleButton(model, view);
    clearMarkersButton(view);
    darkmodeWatcher(view);
    // bsTour();
  });
});

// function bsTour() {
//   const tour = new Shepherd.Tour({
//     defaultStepOptions: {
//       cancelIcon: {
//         enabled: true,
//       },
//       classes: "class-1 class-2",
//       scrollTo: { behavior: "smooth", block: "center" },
//     },
//   });

//   tour.addStep({
//     title: "Creating a Shepherd Tour",
//     text: `Creating a Shepherd tour is easy. too!\
//   Just create a \`Tour\` instance, and add as many steps as you want.`,
//     attachTo: {
//       element: "#map",
//       on: "bottom",
//     },
//     buttons: [
//       {
//         action() {
//           return this.back();
//         },
//         classes: "shepherd-button-secondary",
//         text: "Back",
//       },
//       {
//         action() {
//           return this.next();
//         },
//         text: "Next",
//       },
//     ],
//     id: "creating",
//   });

//   tour.start();
// }

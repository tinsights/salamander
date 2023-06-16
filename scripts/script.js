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
    bsTour();
  });
});

// create a onboarding tour using the shephard js libary
function bsTour() {
  const tour = new Shepherd.Tour({
    defaultStepOptions: {
      classes: "shadow-md bg-purple-dark",
      scrollTo: true,
    },
  });
  const defaultTourButtons = [
    {
      action: tour.back,
      classes: "shepherd-button-secondary",
      text: "Back",
    },
    {
      action: tour.next,
      text: "Next",
    },
  ];

  tour.addStep({
    title: "Welcome!",
    text: "Salamander allows you to explore Singapore's parliamentary electoral history from 2006 to 2020.",
    buttons: [
      {
        action: tour.cancel,
        classes: "shepherd-button-secondary",
        text: "Exit",
      },
      {
        action: tour.next,
        text: "Next",
      },
    ],
  });

  tour.addStep({
    title: "Postal Code Search",
    text: "Search for a postal code to view it's constituency history",
    attachTo: {
      element: "#mobile-menu-container",
      on: "top",
    },
    buttons: defaultTourButtons,
  });
  tour.addStep({
    title: "Change Colour Scheme",
    text: "Toggle between the Constituency or Results colour schemes.",
    attachTo: {
      element: "#toggleBtn",
      on: "top-start",
    },
    buttons: defaultTourButtons,
  });
  tour.addStep({
    title: "Change Years",
    text: "Change between the different election years.",
    attachTo: {
      element: ".control_container",
      on: "top-start",
    },
    buttons: defaultTourButtons,
  });
  tour.addStep({
    title: "Get Address",
    text: "See a location of interest? Right click or long-press to get the address.",
    attachTo: {
      element:
        "#map > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > svg > g > path:nth-child(14)",
      on: "top-start",
    },
    buttons: defaultTourButtons,
  });

  tour.addStep({
    title: "See Election Results",
    text: "Click into a constituency to see the election results. Click on the party card to see the candidates for that party.",
    attachTo: {
      element:
        "#map > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > svg > g > path:nth-child(11)",
      on: "top-start",
    },
    buttons: [
      {
        action: tour.back,
        classes: "shepherd-button-secondary",
        text: "Back",
      },
      {
        action: tour.cancel,
        text: "Exit",
      },
    ],
  });

  //start the tour
  tour.start();
}

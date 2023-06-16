import generateModel from "./model.js";
import { initView, addLayersToMap, removeLoadingScreen, showControls } from "./view.js";
import { addToggleButton, addPostalSearchEvent, darkmodeWatcher, clearMarkersButton } from "./controllers.js";

window.addEventListener("DOMContentLoaded", async () => {
  const view = initView();
  const tour = new Shepherd.Tour({
    defaultStepOptions: {
      classes: "shadow-md bg-purple-dark",
      scrollTo: true,
    },
  });
  bsTour(tour);

  generateModel([2006, 2011, 2015, 2020]).then((model) => {
    addPostalSearchEvent(view);
    addLayersToMap(model, view);
    showControls();
    addToggleButton(model, view);
    clearMarkersButton(view);
    darkmodeWatcher(view);
    const el = document.querySelector("#mobile-menu-container");
    const parent = document.querySelector("#map > div.leaflet-control-container > div.leaflet-bottom.leaflet-right");
    parent.prepend(el);
  });
});

// create a onboarding tour using the shephard js libary
function bsTour(tour) {
  const defaultTourButtons = [
    {
      action: tour.back,
      classes: "shepherd-button-secondary border border-dark",
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
        classes: "shepherd-button-secondary border border-dark",
        text: "Exit",
        action: () => {
          tour.cancel();
          try {
            removeLoadingScreen();
          } catch (error) {}
        },
      },
      {
        action: () => {
          tour.next();
          try {
            removeLoadingScreen();
          } catch (error) {}
        },
        text: "Next",
      },
    ],
  });

  tour.addStep({
    title: "Controls",
    text: "Search via postal code, toggle colour schemes, or change years here.",
    attachTo: {
      element: "#mobile-menu-container",
      on: "top",
    },
    buttons: defaultTourButtons,
  });
  tour.addStep({
    title: "Map Features",
    text: "Tap a constituency to view results. Flip the party card to view candidates. See a location of interest? Right click or long-press to get the address.",
    attachTo: {
      element:
        "#map > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > svg > g > path:nth-child(2)",
      on: "top-start",
    },
    buttons: [
      {
        action: tour.back,
        classes: "shepherd-button-secondary border border-dark",
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

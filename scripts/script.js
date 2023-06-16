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
      classes: "btn btn-secondary border border-dark w-50",
      text: "Back",
    },
    {
      action: tour.next,
      classes: "btn btn-primary border border-dark w-50",
      text: "Next",
    },
  ];

  tour.addStep({
    title: "Welcome!",
    text: "<p>Salamander allows you to explore Singapore's parliamentary electoral history from 2006 to 2020.</p>",
    buttons: [
      {
        classes: "btn btn-secondary border border-dark w-50",
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
        classes: "btn btn-primary border border-dark w-50",
      },
    ],
  });

  tour.addStep({
    title: "Controls",
    text: "<p>Search via postal code,<br>toggle colour schemes,<br>or change years here.</p>",
    attachTo: {
      element: "#mobile-menu-container",
      on: "top",
    },
    buttons: defaultTourButtons,
    cancelIcon: {
      enabled: true,
    },
  });
  tour.addStep({
    title: "Map Features",
    text: `<p><strong>Tap</strong> a constituency to view results. <strong>Flip</strong> the party card to view candidates.<br>See a location of interest? <strong>Right click</strong> or <strong>long-tap</strong> to get the address.</p>`,
    attachTo: {
      element:
        "#map > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > svg > g > path:nth-child(2)",
      on: "top-start",
    },
    buttons: [
      {
        action: tour.back,
        classes: "btn btn-secondary border border-dark w-50",
        text: "Back",
      },
      {
        action: tour.cancel,
        text: "Exit",
        classes: "btn btn-primary border border-dark w-50",
      },
    ],
    cancelIcon: {
      enabled: true,
    },
  });
  //start the tour
  tour.start();
}

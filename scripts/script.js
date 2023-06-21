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

  generateModel([2006, 2011, 2015, 2020]).then((model) => {
    addPostalSearchEvent(view);
    addLayersToMap(model, view);
    document.querySelector(".leaflet-bottom.leaflet-right").classList.add("d-none");
    bsTour(tour);

    addToggleButton(model, view);
    clearMarkersButton(view);
    darkmodeWatcher(view);

    // TO BE REFACTORED:
  });
  // 3) Header to slide up if zoomed-in sufficiently only on mobile
  if (window.innerWidth < 768) {
    const map = view.map;
    const zoomControls = document.querySelector(".leaflet-control-zoom");
    zoomControls.classList.add("fade-in");

    map.on("zoomend", () => {
      const zoom = map.getZoom();
      const header = document.querySelector("#page-header");

      if (zoom >= 12) {
        header.classList.remove("slide-down-fade-in");
        header.classList.add("slide-up-fade-out");
        zoomControls.classList.remove("fade-in");

        zoomControls.classList.add("fade-out");
      } else {
        header.classList.remove("slide-up-fade-out");
        header.classList.add("slide-down-fade-in");
        zoomControls.classList.remove("fade-out");
        zoomControls.classList.add("fade-in");
      }
    });
  }
});

// create a onboarding tour using the shephard js libary
function bsTour(tour) {
  let playback = false;
  function autoplay(interval) {
    console.log(playback);
    if (!playback) {
      playback = true;
      for (let i = 1; i < 4; i++) {
        setTimeout(() => {
          document
            .querySelector(
              `#map > div.leaflet-control-container > div.leaflet-bottom.leaflet-right > div.control_container.leaflet-control > ul > li:nth-child(${
                i + 1
              })`
            )
            .click();
        }, interval * i);
      }
    }
  }
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
    text: "<p>Explore Singapore's electoral consituency history from 2006 to 2020.</p>",
    buttons: [
      {
        classes: "btn btn-secondary border border-dark w-50",
        text: "Exit",
        action: () => {
          try {
            showControls();
            autoplay(500);
            removeLoadingScreen();
          } catch (error) {}
          tour.cancel();
        },
      },
      {
        action: () => {
          try {
            removeLoadingScreen();

            showControls();
            autoplay(1000);
          } catch (error) {
            console.log(error);
          } finally {
            tour.next();
          }
        },
        text: "Next",
        classes: "btn btn-primary border border-dark w-50",
      },
    ],
  });

  tour.addStep({
    title: "Controls",
    text: "<p>Place a marker via postal code, or view changes in constituency boundaries over time.</p>",
    attachTo: {
      element: "#mobile-menu-container",
      on: "top",
    },
    buttons: defaultTourButtons,
  });
  tour.addStep({
    title: "Map Features",
    text: `<p>See a location of interest? <strong>Right click</strong> or <strong>long-tap</strong> to get place down a marker and view its constituency history.</p>`,
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
  });
  //start the tour
  tour.start();
}

import generateModel from "./model.js";
import { initView, addLayersToMap, removeLoadingScreen, showControls, hideHeaderOnZoom } from "./view.js";
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
    removeLoadingScreen();

    bsTour(tour);

    addToggleButton(model, view);
    clearMarkersButton(view);
    darkmodeWatcher(view);
    hideHeaderOnZoom(view);
  });
  // 3) Header to slide up if zoomed-in sufficiently only on mobile
});

// create a onboarding tour using the shephard js libary
function bsTour(tour) {
  let playback = false;
  function autoplay(interval) {
    if (!playback) {
      playback = true;
      for (let i = 1; i < 4; i++) {
        setTimeout(() => {
          document
            .querySelector(
              `#map > div.leaflet-control-container > div.leaflet-bottom.leaflet-right > div.control_container.leaflet-control > ul > li:nth-child(${i + 1
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
    text: "<p>Explore Singapore's electoral constituency history from 2006 to 2020.</p>",
    buttons: [
      {
        classes: "btn btn-secondary border border-dark w-50",
        text: "Exit",
        action: () => {
          try {
            showControls();
            autoplay(500);
            removeLoadingScreen();
          } catch (error) { }
          tour.cancel();
        },
      },
      {
				text: "Next",
        classes: "btn btn-primary border border-dark w-50",
        action: () => {
          try {
            removeLoadingScreen();
            showControls();
            autoplay(1500);
          } catch (error) {
            console.log(error);
          } finally {
            tour.next();
          }
        },
      },
    ],
  });

	tour.addStep({
    title: "Controls",
    text: "<p>View changes in constituency boundaries over the years.</p>",
    attachTo: {
      element: ".control_container.leaflet-control",
      on: "top",
    },
		buttons: [
      {
        classes: "btn btn-secondary border border-dark w-50",
        text: "Back",
        action: tour.back(),
      },
      {
				text: "Next",
        classes: "btn btn-primary border border-dark w-50",
        action: () => {
					setTimeout(() => document.querySelector("#toggleBtn").click(), 500);
					setTimeout(() => document.querySelector("#toggleBtn").click(), 1500);
					tour.next();
        },
      },
    ],
  });

	tour.addStep({
    title: "Controls",
    text: "<p>Toggle between election results and constituency colours.</p>",
    attachTo: {
      element: "#toggleBtn",
      on: "top",
    },
    buttons: [
			{
				text: "Back",
				classes: "btn btn-secondary border border-dark w-50",
				action: tour.back(),
			},
			{ text: "Next",
				classes: "btn btn-primary border border-dark w-50",
				action: () => {
					document.querySelector("#postalCodeSelector").value = "307516"
					setTimeout(() => document.querySelector("#postalCodeBtn").click(), 1000);
					tour.next();
				},
			},
		],
  });

  tour.addStep({
    title: "Controls",
    text: "<p>Search via postal code to view a location's constituency history.</p>",
    attachTo: {
      element: "#mobile-menu-container",
      on: "top",
    },
		buttons: defaultTourButtons,
  });
	
	 
  tour.addStep({
    title: "Map Features",
    text: `<p>See a location of interest? <strong>Right click</strong> or <strong>long-tap</strong> to place down a marker and view its constituency history.</p>`,
    attachTo: {
      element:
        "#map > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > svg > g > path:nth-child(2)",
      on: "top-start",
    },
    buttons: [
      {
        action: tour.back(),
        classes: "btn btn-secondary border border-dark w-50",
        text: "Back",
      },
      {
        action: tour.cancel(),
        text: "Exit",
        classes: "btn btn-primary border border-dark w-50",
      },
    ],
  });
  //start the tour
  tour.start();
}

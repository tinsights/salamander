function addToggleButton(model, view) {
  const toggleBtn = document.getElementById("toggleBtn");

  function toggleView() {
    view.currentStyle = view.currentStyle === "defaultStyle" ? "resultStyle" : "defaultStyle";
    console.log(view);
    Object.values(model).forEach((year) => {
      setView(year.CONSTITUENCIES, view.currentStyle);
    });
  }

  toggleBtn.addEventListener("click", toggleView);
}

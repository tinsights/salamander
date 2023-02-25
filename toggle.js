const toggleBtn = document.getElementById('toggleBtn');

function toggleView() {
  view.currentStyle = view.currentStyle === 'defaultStyle' ? 'resultStyle' : 'defaultStyle';
  console.log(view);
  Object.values(model.YEARS).forEach((year) => {
    const constituencies = Object.values(model.CONSTITUENCIES)
      .map((constituency) => constituency[year])
      .filter((e) => e !== undefined);

    setView(constituencies, view.currentStyle);
  });
}

toggleBtn.addEventListener('click', toggleView);

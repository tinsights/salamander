// CHART

export default function createChart(model) {
  const labels = Object.keys(model);

  const parties = {};
  labels.forEach((year, idx) => {
    Object.entries(model[year].RESULTS).forEach(([party, votes]) => {
      party = party === 'Independent' ? 'INDP' : party;
      if (!parties[party]) {
        parties[party] = {
          label: party,
          data: Array(4).fill(0),
          stack: 'Stack 0',
        };
      }
      parties[party].data[idx] = votes.totalVotes;
      if (party === 'PAP') {
        parties[party].stack = 'Stack 1';
      }
    });
  });
  const datasets = Object.values(parties);

  const data = {
    labels,
    datasets,
  };

  const config = {
    type: 'bar',
    data,
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Election Results 2006-2020',
        },
        legend: {
          display: false,
        },
      },
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
      },
      scales: {
        x: {
          stacked: true,
        },
        y: {
          stacked: true,
          ticks: {
            display: false,
          },
        },
      },
    },
  };

  const ctx = document.getElementById('myChart');

  const chart = new Chart(ctx, config);
}

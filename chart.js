// CHART

function createChart(model) {
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
  console.log(parties);

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

  const canvas = document.getElementById('halfDonut');
  const dashboardChart = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: ['Red'],
      datasets: [{
        label: '# of Votes',
        data: [33],
        backgroundColor: [
          'rgba(231, 76, 60, 1)',
        ],
        borderColor: [
          'rgba(255, 255, 255 ,1)',
        ],
        borderWidth: 5,
      }],

    },
    options: {
      rotation: 0,
      circumference: (0.44 * 360),
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
      cutoutPercentage: 100,
    },
  });
}

function createDonut(vote_share, vote_percentage, party) {
  console.log(vote_share);
  const backgroundColor = ['#FF0000'];
  let rotation = 0;
  if (party === 'PAP') {
    backgroundColor[0] = '#0000FF';
    rotation = (1 - vote_percentage) * 360;
  }
  const container = document.createElement('div');
  const donut = document.createElement('canvas');
  const voteMeter = new Chart(donut, {
    type: 'doughnut',
    data: {
      datasets: [{
        label: '# of Votes',
        data: [Number(vote_share)],
        backgroundColor,
        borderWidth: 5,
      }],

    },
    options: {
      rotation,
      circumference: (Number(vote_percentage) * 360),
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
  });
  container.appendChild(donut);
  return container;
}

const labels = [2006, 2011, 2015, 2020];
const data = {
  labels,
  datasets: [
    {
      label: 'PAP',
      data: [Math.random() * 1000, Math.random() * 1000, Math.random() * 1000, Math.random() * 1000, Math.random() * 1000, Math.random() * 1000, Math.random() * 1000],
      // backgroundColor: Utils.CHART_COLORS.red,
      stack: 'Stack 0',
    },
    {
      label: 'Dataset 2',
      data: [Math.random() * 1000, Math.random() * 1000, Math.random() * 1000, Math.random() * 1000, Math.random() * 1000, Math.random() * 1000, Math.random() * 1000],
      // backgroundColor: Utils.CHART_COLORS.blue,
      stack: 'Stack 0',
    },
    {
      label: 'Dataset 3',
      data: [Math.random() * 1000, Math.random() * 1000, Math.random() * 1000, Math.random() * 1000, Math.random() * 1000, Math.random() * 1000, Math.random() * 1000],
      // backgroundColor: Utils.CHART_COLORS.green,
      stack: 'Stack 1',
    },
  ],
};

const config = {
  type: 'bar',
  data,
  options: {
    plugins: {
      title: {
        display: true,
        text: 'Chart.js Bar Chart - Stacked',
      },
    },
    responsive: true,
    interaction: {
      intersect: false,
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
      },
    },
  },
};

const ctx = document.getElementById('myChart');

const chart = new Chart(ctx, config);

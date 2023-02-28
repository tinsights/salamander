/**
 * MODEL
 * takes in an array of election years as input,
 * creates an object with year as keys, Leaflet layer element as value.
 *
 */
async function generateModel(yrs) {
  const model = {};
  const pastelColorIter = pastelColorGenerator();
  yrs.forEach((yr) => {
    model[yr] = {
      CONSTITUENCIES: {},
      RESULTS: {},
    };
  });
  const oldYearDataReqs = yrs.map((yr) => Promise.all([getElectionResults(yr), getElectionBoundaries(yr)]));
  return Promise.all(oldYearDataReqs)
    .then((yearResults) => {
      yearResults.forEach((yearData) => newCreateModel(yearData));
      return model;
    });

  function newCreateModel([yearResults, yearBoundaries]) {
    const { year } = yearResults[0];
    yearBoundaries.features.forEach((feature) => {
      const currConstituency = feature.properties.ED_DESC;
      const boundaries = yearBoundaries.features.filter((boundary) => boundary.properties.ED_DESC === currConstituency);
      const results = yearResults.filter((result) => result.constituency.toUpperCase() === currConstituency);
      const resultStyle = generateConstituencyStyle(results);

      results.forEach((result) => {
        if (!model[year].RESULTS[result.party]) {
          model[year].RESULTS[result.party] = {
            totalVotes: 0,
          };
        }
        if (result.vote_count !== 'na') {
          model[year].RESULTS[result.party].totalVotes += +result.vote_count;
        }
      });

      if (!allConstituencies[currConstituency]) {
        const defaultColor = pastelColorIter.next().value;
        const defaultStyle = {
          color: 'black',
          opacity: 1,
          fillColor: defaultColor,
          fillOpacity: 0.7,
          weight: 3,
        };
        allConstituencies[currConstituency] = {
          yearsPresent: [],
          defaultStyle,
        };
      }
      allConstituencies[currConstituency].yearsPresent.push(year);
      model[year].CONSTITUENCIES[currConstituency] = {
        boundaries,
        results,
        style: {
          defaultStyle: allConstituencies[currConstituency].defaultStyle,
          resultStyle,
        },
      };
    });
  }
}
function generateConstituencyStyle(constituencyResults) {
  // console.log(constituencyResults);
  let winner = {};
  if (constituencyResults.length > 1) {
    constituencyResults.forEach((result) => {
      winner = result.vote_percentage > 0.5 ? result : winner;
    });
  } else {
    [winner] = constituencyResults;
    winner.vote_percentage = 1;
  }
  switch (winner.party) {
    case 'PAP': {
      return {
        color: 'black',
        fillColor: `rgb(${(1 - winner.vote_percentage) * 255}, 0, ${winner.vote_percentage * 255})`,
        fillOpacity: Math.min(winner.vote_percentage, 0.7),
        weight: 3,
      };
    }
    default: return {
      color: 'black',
      fillColor: `rgb(${winner.vote_percentage * 255}, 0, ${(1 - winner.vote_percentage) * 255})`,
      fillOpacity: Math.min(winner.vote_percentage, 0.7),
      weight: 3,

    };
  }
}
function boundaryColorGenerator() {
  return CSS_COLOR_NAMES.splice(1, 1)[0];
}

function* pastelColorGenerator() {
  let hue = 0;
  let counter = 0;
  const increment = 37;
  let color = '';
  while (true) {
    if (counter % 3 === 0) {
      color = `hsla(${hue}, 50%,  80%)`;
    } else if (counter % 3 === 1) {
      color = `hsla(${hue}, 65%,  65%)`;
    } else {
      color = `hsla(${hue}, 80%,  50%)`;
    }
    hue += increment;
    counter += 1;
    yield color;
  }
}

async function getElectionResults(year) {
  const yearResultsResponse = await axios.get(`https://data.gov.sg/api/action/datastore_search?resource_id=4706f2cb-a909-4cc0-bd3d-f366c34cf6af&q=${year}`);
  const yearResults = yearResultsResponse.data.result.records;
  return yearResults;
}

async function getElectionBoundaries(year) {
  const yearBoundariesResponse = await axios.get(`data/electoral-boundary-${year}/electoral-boundary-${year}-kml.geojson`);
  const yearBoundaries = yearBoundariesResponse.data;
  return yearBoundaries;
}

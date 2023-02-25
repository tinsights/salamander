/**
 * MODEL
 * takes in an array of election years as input,
 * creates an object with year as keys, Leaflet layer element as value.
 *
 */
async function generateModel(years) {
  const newModel = {
    YEARS: years,
    CONSTITUENCIES: {},
  };
  const yearDataReqs = years.map((year) => Promise.all([getElectionResults(year), getElectionBoundaries(year)]));
  return Promise.all(yearDataReqs)
    .then((yearResults) => {
      yearResults.forEach((yearData) => createModel(yearData));
      return newModel;
    });

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

  function createModel([yearResults, yearBoundaries]) {
    const { year } = yearResults[0];
    yearBoundaries.features.forEach((feature) => {
      const currConstituency = feature.properties.ED_DESC;
      const constituencyResults = yearResults.filter((result) => result.constituency.toUpperCase() === currConstituency);
      const constituencyBoundaries = yearBoundaries.features.filter((boundary) => boundary.properties.ED_DESC === currConstituency);
      const resultStyle = generateConstituencyStyle(constituencyResults);

      // if new constituency,
      // create a new key in model
      // add results and boundaries of current year
      if (!newModel.CONSTITUENCIES[currConstituency]) {
        const defaultColor = boundaryColorGenerator();
        newModel.CONSTITUENCIES[currConstituency] = {
          defaultColor,
        };
      }
      const { defaultColor } = newModel.CONSTITUENCIES[currConstituency];
      const defaultStyle = {
        color: 'black',
        fillColor: defaultColor,
        fillOpacity: 0.7,
        weight: 3,
      };
      // else if constituency already exists, add
      newModel.CONSTITUENCIES[currConstituency][year] = {
        results: {},
        boundaries: {},
        style: {
          resultStyle,
          defaultStyle,
        },
      };
      newModel.CONSTITUENCIES[currConstituency][year].results = constituencyResults;
      newModel.CONSTITUENCIES[currConstituency][year].boundaries = constituencyBoundaries;
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

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
        newModel.CONSTITUENCIES[currConstituency] = {
          boundaryColor: boundaryColorGenerator(),
        };
      }
      // else if constituency already exists, add
      const defaultStyle = { color: newModel.CONSTITUENCIES[currConstituency].boundaryColor };
      newModel.CONSTITUENCIES[currConstituency][year] = {
        results: {},
        boundaries: {},
        style: {
          defaultStyle,
          resultStyle,
        },
      };
      newModel.CONSTITUENCIES[currConstituency][year].results = constituencyResults;
      newModel.CONSTITUENCIES[currConstituency][year].boundaries = constituencyBoundaries;
    });
  }
}

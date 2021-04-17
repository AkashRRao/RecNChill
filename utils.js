const axios = require('axios');

const getMoviesFromQuery = async (query) => {
  let result = {};
  try {
    result = await axios.get(
      `https://api.themoviedb.org/3/search/multi?api_key=${process.env.MOVIE_DB_API_KEY}&query=${query}`
    );
    result = result.data;
  } catch (error) {
    result = { error: error };
  }
  return result;
};

const getMovieFromTmdbId = async (id) => {
  let result = {};
  try {
    result = await axios.get(
      `https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.MOVIE_DB_API_KEY}`
    );
    result = result.data;
  } catch (error) {
    result = { error: error };
  }
  return result;
};

module.exports.getMovieFromTmdbId = getMovieFromTmdbId;
module.exports.getMoviesFromQuery = getMoviesFromQuery;

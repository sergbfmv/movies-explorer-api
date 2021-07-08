const Movie = require('../models/movie');
const CastError = require('../errors/cast-error');
const ValidationError = require('../errors/validation-error');
const ForbiddenError = require('../errors/forbidden-error');

module.exports.getMovies = (req, res, next) => {
  Movie.find({})
    .then((cards) => res.send({ data: cards }))
    .catch(next);
};

module.exports.createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
  } = req.body;
  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
    owner: req.user._id,
  })
    .then((movie) => res.send({ data: movie }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        const error = new ValidationError('Переданы некорректные данные фильма');
        next(error);
      } else {
        next(err);
      }
    });
};

module.exports.deleteMovie = (req, res, next) => {
  Movie.findOneAndRemove({ movieId: req.body.movieId })
    .then((movie) => {
      if (movie === null) {
        throw new CastError('Фильм не найден');
      }
      if (movie.owner === req.user._id) {
        throw new ForbiddenError('Нельзя удалять чужие фильмы!');
      }
      Movie.findByIdAndRemove(req.movieId)
        .then((item) => res.send({ data: item }))
        .catch((err) => {
          if (err.name === 'CastError') {
            const error = new CastError('Фильм с указанным id не найден');
            next(error);
          } else {
            next(err);
          }
        });
    })
    .catch((err) => {
      if (err.name === 'TypeError') {
        const error = new CastError('Фильм с указанным id не найден');
        next(error);
      } else {
        next(err);
      }
    });
};

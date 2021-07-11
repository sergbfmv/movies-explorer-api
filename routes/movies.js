const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const auth = require('../middlewares/auth');
const { getMovies, createMovie, deleteMovie } = require('../controllers/movies');

router.get('/movies', auth, getMovies);

router.post('/movies', celebrate({
  body: Joi.object().keys({
    country: Joi.string().required(),
    director: Joi.string().required(),
    duration: Joi.number().required(),
    year: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string().required(),
    trailer: Joi.string().required(),
    nameRU: Joi.string().required(),
    nameEN: Joi.string().required(),
    thumbnail: Joi.string().required(),
    movieId: Joi.string().required().hex().length(24),
  }),
}), auth, createMovie);

router.delete('/movies/movieId', celebrate({
  body: Joi.object().keys({
    movieId: Joi.number().required(),
  }),
}), auth, deleteMovie);

module.exports = router;

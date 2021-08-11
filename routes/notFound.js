const router = require('express').Router();
const NotFoundError = require('../errors/not-found-error');
const auth = require('../middlewares/auth');

router.use('*', auth, (req, res, next) => {
  const error = new NotFoundError('Страница не найдена');
  next(error);
});

module.exports = router;

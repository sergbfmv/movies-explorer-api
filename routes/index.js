const { errors } = require('celebrate');
const router = require('express').Router();
const auth = require('../middlewares/auth');
const { requestLogger, errorLogger } = require('../middlewares/logger');
const { createUser, login } = require('../controllers/users');

router.use(requestLogger);

router.use('/signup', createUser);
router.use('/signin', login);

router.use('/', require('./users'));
router.use('/', require('./movies'));
router.use('/', auth, require('./notFound'));

router.use(errorLogger);

router.use(errors());

module.exports = router;

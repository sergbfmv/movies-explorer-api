const { errors } = require('celebrate');
const router = require('express').Router();
const auth = require('../middlewares/auth');

router.use('/', require('./users'));
router.use('/', require('./movies'));
router.use('/', auth, require('./notFound'));

router.use(errors());

module.exports = router;

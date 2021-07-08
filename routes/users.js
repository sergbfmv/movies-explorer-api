const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { getUserMe, updateUser } = require('../controllers/users');
const auth = require('../middlewares/auth');

router.get('/users/me', auth, getUserMe);

router.patch('/users/me', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    name: Joi.string().required(),
  }),
}), auth, updateUser);

module.exports = router;

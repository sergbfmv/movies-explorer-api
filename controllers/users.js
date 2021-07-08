const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const ValidationError = require('../errors/validation-error');
const CastError = require('../errors/cast-error');
const ForbiddenError = require('../errors/forbidden-error');
const MongoError = require('../errors/mongo-error');
const AuthError = require('../errors/auth-error');

module.exports.getUserMe = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => res.send({ data: user }))
    .catch(next);
};

module.exports.updateUser = (req, res, next) => {
  const { name, email } = req.body;
  User.findByIdAndUpdate(req.user._id,
    { name: name.toString(), email: email.toString() }, { runValidators: true })
    .then((user) => {
      if (user === null) {
        throw new CastError('Пользователь с указанным id не найдена');
      } else {
        res.send({ data: user });
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        const error = new ValidationError('Переданы некорректные данные пользователя');
        next(error);
      } else if (err.name === 'CastError') {
        const error = new CastError('Пользователь с указанным id не найден');
        next(error);
      } else if (err.name === 'TypeError') {
        const error = new ForbiddenError('Нельзя редактировать чужого пользователя!');
        next(error);
      } else {
        next(err);
      }
    });
};

module.exports.createUser = (req, res, next) => {
  const {
    name, email, password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name,
      email,
      password: hash,
    }))
    .then((user) => res.send({
      data: {
        name: user.name,
        email: user.email,
      },
    }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        const error = new ValidationError('Переданы некорректные данные пользователя');
        next(error);
      } else if (err.name === 'MongoError' && err.code === 11000) {
        const error = new MongoError('Такой email уже зарегистрирован');
        next(error);
      } else {
        next(err);
      }
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, 'super-strong-secret', { expiresIn: '7d' });
      res.send({ token });
      next();
    })
    .catch(() => {
      const error = new AuthError('Невозможно авторизоваться');
      next(error);
    })
    .catch(next);
};

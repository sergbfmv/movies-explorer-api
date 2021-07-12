const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const ValidationError = require('../errors/validation-error');
const MongoError = require('../errors/mongo-error');
const AuthError = require('../errors/auth-error');
const NotFoundError = require('../errors/not-found-error');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
        { expiresIn: '7d' },
      );
      res.send({ token });
      next();
    })
    .catch(() => {
      const error = new AuthError('Неправильная почта или пароль');
      next(error);
    })
    .catch(next);
};

module.exports.getUserMe = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => res.send({ data: user }))
    .catch(next);
};

module.exports.updateUser = (req, res, next) => {
  const { name, email } = req.body;
  User.findOne({ email })
    .then((user) => {
      if (user !== null) {
        throw new MongoError('Пользователь с таким email уже существует');
      }
      User.findByIdAndUpdate(req.user._id,
        { name: name.toString(), email: email.toString() }, { runValidators: true })
        .then((anyUser) => {
          if (anyUser === null) {
            throw new NotFoundError('Пользователь с указанным id не найден');
          } else {
            res.send({ data: anyUser });
          }
        })
        .catch((err) => {
          if (err.name === 'ValidationError') {
            const error = new ValidationError('Переданы некорректные данные пользователя');
            next(error);
          } else {
            next(err);
          }
        });
    })
    .catch(next);
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

const jwt = require('jsonwebtoken');
const AuthError = require('../errors/auth-error');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new AuthError('Вы не авторизованы!');
  }

  const token = authorization.replace('Bearer ', '');
  let payload;
  try {
    // попытаемся верифицировать токен
    payload = jwt.verify(token, 'super-strong-secret');
  } catch (e) {
    // отправим ошибку, если не получилось
    const err = new AuthError('Вы не авторизованы!');

    next(err);
  }
  req.user = payload;
  next();
};

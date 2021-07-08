const router = require('express').Router();

router.use('*', (req, res) => {
  res.status(404).send({ message: 'Запрашиваемая страница не найдена' });
});

module.exports = router;

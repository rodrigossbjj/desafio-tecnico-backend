const express = require('express');
const router = express.Router();
const {autenticarToken} = require('../middlewares/auth.middleware');

// console.log('[DEBUG] Tipo de autenticarToken:', typeof autenticarToken);
// console.log('[DEBUG] Conteúdo:', autenticarToken.toString()); //Mostra parte da função

router.get('/', autenticarToken, (req, res) => {
  res.json({ usuario: req.usuario });
});

// console.log('[DEBUG] Router configurado:', router.stack);

module.exports = router;

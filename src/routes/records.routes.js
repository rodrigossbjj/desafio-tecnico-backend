const express = require('express');
const router = express.Router();
const { searchRecords } = require('../controllers/records.controller'); //Importa função
const { autenticarToken } = require('../middlewares/auth.middleware'); //Importa função

router.get('/search', autenticarToken, searchRecords);

module.exports = router;

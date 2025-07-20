const express = require('express');
const router = express.Router();
const { createQuery } = require('../controllers/queries.controller'); 
const { autenticarToken } = require('../middlewares/auth.middleware');

router.post('/', autenticarToken, createQuery);

module.exports = router;
 
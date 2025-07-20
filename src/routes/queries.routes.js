const express = require('express');
const router = express.Router();
const { createQuery, listQueries } = require('../controllers/queries.controller'); 
const { autenticarToken } = require('../middlewares/auth.middleware');

router.post('/', autenticarToken, createQuery);
router.get('/', autenticarToken, listQueries)

module.exports = router;
 
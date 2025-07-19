const express = require('express');
const router = express.Router();
const { autenticarToken } = require('../middlewares/auth.middleware');
const userController = require('../controllers/user.controller');

//GET /user/
router.get('/me', autenticarToken, userController.getMe);

module.exports = router;

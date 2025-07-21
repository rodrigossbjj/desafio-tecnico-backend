const express = require('express');
const router = express.Router();
const { autenticarToken } = require('../middlewares/auth.middleware');
const userController = require('../controllers/user.controller');

/**
 * @swagger
 * /user/me:
 *   get:
 *     summary: Retorna os dados do usuário autenticado
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 usuario:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 0
 *                       description: ID do usuário
 *                     nome:
 *                       type: string
 *                       example: "string"
 *                       description: Nome do usuário
 *                     iat:
 *                       type: integer
 *                       example: 0
 *                       description: Timestamp de emissão do token (issued at)
 *                     exp:
 *                       type: integer
 *                       example: 0
 *                       description: Timestamp de expiração do token (expiration)
 *       401:
 *         description: Token inválido ou ausente (não autorizado)
 */

router.get('/me', autenticarToken, userController.getMe);

module.exports = router;

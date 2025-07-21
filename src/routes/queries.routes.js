const express = require('express');
const router = express.Router();
const { createQuery, listQueries } = require('../controllers/queries.controller'); 
const { autenticarToken } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * /queries:
 *   post:
 *     summary: Registra uma pergunta e simula uma resposta com base no conteúdo do dataset. Um MOCK IA
 *     tags: [Queries]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pergunta
 *               - datasetId
 *             properties:
 *               pergunta:
 *                 type: string
 *               datasetId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Pergunta registrada e resposta simulada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token inválido ou ausente
 */
router.post('/', autenticarToken, createQuery);

/**
 * @swagger
 * /queries:
 *   get:
 *     summary: Lista as perguntas e respostas anteriores feitas pelo usuário autenticado
 *     tags: [Queries]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de consultas retornada com sucesso
 *       401:
 *         description: Token inválido ou ausente
 */
router.get('/', autenticarToken, listQueries)

module.exports = router;
 
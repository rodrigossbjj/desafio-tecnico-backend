const express = require('express');
const router = express.Router();
const { searchRecords } = require('../controllers/records.controller'); //Importa função
const { autenticarToken } = require('../middlewares/auth.middleware'); //Importa função


/**
 * @swagger
 * /records/search:
 *   get:
 *     summary: Realiza uma busca textual por palavra-chave nos registros JSON dos datasets
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         required: true
 *         description: Palavra-chave para buscar nos registros
 *     responses:
 *       200:
 *         description: Registros encontrados com sucesso
 *       400:
 *         description: Palavra-chave ausente ou inválida
 *       401:
 *         description: Token inválido ou ausente
 */
router.get('/search', autenticarToken, searchRecords);

module.exports = router;

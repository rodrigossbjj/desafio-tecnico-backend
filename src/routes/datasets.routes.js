const express = require('express');
const router = express.Router();
const { autenticarToken } = require('../middlewares/auth.middleware'); //Importa função
const upload = require('../middlewares/upload.middleware');
const { uploadDataset, listDatasets, listRecords } = require('../controllers/datasets.controller'); //Importa função

/**
 * @swagger
 * /datasets:
 *   get:
 *     summary: Lista os datasets do usuário autenticado
 *     tags: [Datasets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de datasets retornada com sucesso
 *       401:
 *         description: Token inválido ou ausente
 */
router.get('/datasets', autenticarToken, listDatasets);

/**
 * @swagger
 * /datasets/{id}/records:
 *   get:
 *     summary: Lista os registros de um dataset específico
 *     tags: [Datasets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do dataset
 *     responses:
 *       200:
 *         description: Lista de registros retornada com sucesso
 *       401:
 *         description: Token inválido ou ausente
 *       404:
 *         description: Dataset não encontrado
 */
router.get('/:id/records', autenticarToken, listRecords);

/**
 * @swagger
 * /datasets/upload:
 *   post:
 *     summary: Faz upload de um arquivo (.csv ou .pdf) e processa seus dados
 *     tags: [Datasets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               arquivo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Arquivo processado e dados salvos com sucesso
 *       400:
 *         description: Arquivo ausente ou formato inválido
 *       401:
 *         description: Token inválido ou ausente
 */
router.post('/upload', autenticarToken, upload.single('arquivo'), uploadDataset);

module.exports = router;

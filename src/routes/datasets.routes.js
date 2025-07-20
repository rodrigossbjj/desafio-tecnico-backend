const express = require('express');
const router = express.Router();
const { autenticarToken } = require('../middlewares/auth.middleware'); //Importa função
const upload = require('../middlewares/upload.middleware');
const { uploadDataset, listDatasets, listRecords } = require('../controllers/datasets.controller'); //Importa função

router.get('/datasets', autenticarToken, listDatasets);
router.get('/:id/records', autenticarToken, listRecords);
router.post('/upload', autenticarToken, upload.single('arquivo'), uploadDataset);

module.exports = router;

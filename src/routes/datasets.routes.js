const express = require('express');
const router = express.Router();
const { autenticarToken } = require('../middlewares/auth.middleware'); // IMPORTA A FUNÇÃO
const upload = require('../middlewares/upload.middleware');
const { uploadDataset } = require('../controllers/datasets.controller');
const { listDatasets } = require('../controllers/datasets.controller');


router.get('/datasets', autenticarToken, listDatasets);
router.post('/upload', autenticarToken, upload.single('arquivo'), uploadDataset);

module.exports = router;

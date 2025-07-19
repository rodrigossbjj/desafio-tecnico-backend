const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const parseCSV = require('../utils/parseCSV');

exports.uploadDataset = async (req, res) => {
  try {
    console.log('req.file:', req.file);
    console.log('req.body:', req.body);

    if (!req.usuario) return res.status(401).json({ erro: 'Usuário não autenticado.' });

    const file = req.file;
    const userId = req.usuario.id;

    if (!file) {
      return res.status(400).json({ error: 'Arquivo não enviado' });
    }

    const dataset = await prisma.dataset.create({
      data: {
        nome: file.originalname,
        tamanho: file.size,
        usuarioId: userId,
      },
    });

    //Se for .csv, processar conteúdo
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.csv') {
      const registros = await parseCSV(file.path);
      await prisma.record.createMany({
        data: registros.map(item => ({
          datasetId: dataset.id,
          dadosJson: item
        }))
      });
    }

    return res.status(201).json({
      mensagem: 'Upload realizado com sucesso',
      datasetId: dataset.id
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao processar o upload' });
  }
};

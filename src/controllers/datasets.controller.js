const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const parseCSV = require('../utils/parseCSV');
const pdfParse = require('pdf-parse');

exports.listDatasets = async (req, res) => {
  try {
    if (!req.usuario) return res.status(401).json({ erro: 'Usuário não autenticado.' });

    const userId = req.usuario.id;

    const datasets = await prisma.dataset.findMany({
      where: { usuarioId: userId },
      orderBy: { criadoEm: 'desc' },
    });

    res.json(datasets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao listar datasets' });
  }
};

exports.listRecords = async (req, res) => {
  try {
    if (!req.usuario) return res.status(401).json({ erro: 'Usuário não autenticado.' });

    const userId = req.usuario.id;
    const datasetId = parseInt(req.params.id);

    //Verifica se o dataset pertence ao usuário
    const dataset = await prisma.dataset.findUnique({
      where: { id: datasetId },
    });

    if (!dataset || dataset.usuarioId !== userId) {
      return res.status(404).json({ erro: 'Dataset não encontrado' });
    }

    //Busca os registros associados
    const records = await prisma.record.findMany({
      where: { datasetId: datasetId },
      orderBy: { id: 'asc' }, //ordenar por id
    });

    return res.json(records);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao listar registros' });
  }
};


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
    } else if (ext === '.pdf') {
      const pdfBuffer = fs.readFileSync(file.path); //Lê o arquivo PDF como buffer
      const data = await pdfParse(pdfBuffer);       //Extrai o texto do PDF

      await prisma.record.create({
        data: {
          datasetId: dataset.id,
          dadosJson: {
            texto: data.text.trim() //Armazena como JSON { texto: "...conteúdo..." }
          }
        }
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

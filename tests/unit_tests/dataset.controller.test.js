const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const parseCSV = require('../../src/utils/parseCSV');

const { listDatasets, listRecords, uploadDataset } = require('../../src/controllers/datasets.controller');

const prisma = require('@prisma/client');

jest.mock('@prisma/client', () => {
  const mPrisma = {
    dataset: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    record: {
      findMany: jest.fn(),
      createMany: jest.fn(),
      create: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mPrisma) };
});

jest.mock('../../src/utils/parseCSV');
jest.mock('pdf-parse');
jest.mock('fs');

describe('Datasets Controller', () => {
  let req, res, prismaClient;

   beforeAll(() => {
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterAll(() => {
    consoleSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  beforeEach(() => {
    prismaClient = new prisma.PrismaClient();
    req = { body: {}, params: {}, usuario: null, file: null };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('listDatasets', () => {
    it('deve retornar 401 se usuário não autenticado', async () => {
      req.usuario = null;
      await listDatasets(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Usuário não autenticado.' });
    });

    it('deve retornar lista de datasets do usuário', async () => {
      req.usuario = { id: 1 };
      const fakeDatasets = [{ id: 1, nome: 'dataset1' }, { id: 2, nome: 'dataset2' }];
      prismaClient.dataset.findMany.mockResolvedValue(fakeDatasets);

      await listDatasets(req, res);

      expect(prismaClient.dataset.findMany).toHaveBeenCalledWith({
        where: { usuarioId: 1 },
        orderBy: { criadoEm: 'desc' },
      });
      expect(res.json).toHaveBeenCalledWith(fakeDatasets);
    });

    it('deve retornar 500 em erro interno', async () => {
      req.usuario = { id: 1 };
      prismaClient.dataset.findMany.mockRejectedValue(new Error('fail'));

      await listDatasets(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao listar datasets' });
    });
  });

  describe('listRecords', () => {
    it('deve retornar 401 se usuário não autenticado', async () => {
      req.usuario = null;
      await listRecords(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Usuário não autenticado.' });
    });

    it('deve retornar 404 se dataset não existe ou não pertence ao usuário', async () => {
      req.usuario = { id: 1 };
      req.params.id = '100';

      prismaClient.dataset.findUnique.mockResolvedValue(null); // não achou dataset

      await listRecords(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Dataset não encontrado' });

      // Testa dataset que pertence a outro usuário
      prismaClient.dataset.findUnique.mockResolvedValue({ id: 100, usuarioId: 2 });
      await listRecords(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Dataset não encontrado' });
    });

    it('deve retornar lista de registros do dataset', async () => {
      req.usuario = { id: 1 };
      req.params.id = '10';
      prismaClient.dataset.findUnique.mockResolvedValue({ id: 10, usuarioId: 1 });

      const fakeRecords = [{ id: 1, dadosJson: {} }, { id: 2, dadosJson: {} }];
      prismaClient.record.findMany.mockResolvedValue(fakeRecords);

      await listRecords(req, res);

      expect(prismaClient.record.findMany).toHaveBeenCalledWith({
        where: { datasetId: 10 },
        orderBy: { id: 'asc' },
      });
      expect(res.json).toHaveBeenCalledWith(fakeRecords);
    });

    it('deve retornar 500 em erro interno', async () => {
      req.usuario = { id: 1 };
      req.params.id = '10';
      prismaClient.dataset.findUnique.mockResolvedValue({ id: 10, usuarioId: 1 });
      prismaClient.record.findMany.mockRejectedValue(new Error('fail'));

      await listRecords(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao listar registros' });
    });
  });

  describe('uploadDataset', () => {
    it('deve retornar 401 se usuário não autenticado', async () => {
      req.usuario = null;
      await uploadDataset(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Usuário não autenticado.' });
    });

    it('deve retornar 400 se arquivo não enviado', async () => {
      req.usuario = { id: 1 };
      req.file = null;

      await uploadDataset(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Arquivo não enviado' });
    });

    it('deve processar e salvar registros CSV', async () => {
      req.usuario = { id: 1 };
      req.file = {
        originalname: 'dados.csv',
        size: 123,
        path: '/fake/path/dados.csv',
      };

      const registrosMock = [
        { coluna1: 'valor1' },
        { coluna1: 'valor2' },
      ];

      prismaClient.dataset.create.mockResolvedValue({ id: 42 });
      parseCSV.mockResolvedValue(registrosMock);
      prismaClient.record.createMany.mockResolvedValue();

      await uploadDataset(req, res);

      expect(prismaClient.dataset.create).toHaveBeenCalledWith({
        data: {
          nome: 'dados.csv',
          tamanho: 123,
          usuarioId: 1,
        },
      });

      expect(parseCSV).toHaveBeenCalledWith('/fake/path/dados.csv');

      expect(prismaClient.record.createMany).toHaveBeenCalledWith({
        data: registrosMock.map(item => ({
          datasetId: 42,
          dadosJson: item,
        })),
      });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        mensagem: 'Upload realizado com sucesso',
        datasetId: 42,
      });
    });

    it('deve processar e salvar arquivo PDF', async () => {
      req.usuario = { id: 1 };
      req.file = {
        originalname: 'arquivo.pdf',
        size: 456,
        path: '/fake/path/arquivo.pdf',
      };

      const fakePdfText = 'Conteúdo do PDF';

      prismaClient.dataset.create.mockResolvedValue({ id: 99 });
      fs.readFileSync.mockReturnValue(Buffer.from('fake pdf data'));
      pdfParse.mockResolvedValue({ text: fakePdfText });
      prismaClient.record.create.mockResolvedValue();

      await uploadDataset(req, res);

      expect(prismaClient.dataset.create).toHaveBeenCalledWith({
        data: {
          nome: 'arquivo.pdf',
          tamanho: 456,
          usuarioId: 1,
        },
      });

      expect(fs.readFileSync).toHaveBeenCalledWith('/fake/path/arquivo.pdf');
      expect(pdfParse).toHaveBeenCalledWith(Buffer.from('fake pdf data'));

      expect(prismaClient.record.create).toHaveBeenCalledWith({
        data: {
          datasetId: 99,
          dadosJson: {
            texto: fakePdfText.trim(),
          },
        },
      });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        mensagem: 'Upload realizado com sucesso',
        datasetId: 99,
      });
    });

    it('deve retornar 500 em erro interno', async () => {
      req.usuario = { id: 1 };
      req.file = {
        originalname: 'dados.csv',
        size: 123,
        path: '/fake/path/dados.csv',
      };

      prismaClient.dataset.create.mockRejectedValue(new Error('fail'));

      await uploadDataset(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao processar o upload' });
    });
  });
});

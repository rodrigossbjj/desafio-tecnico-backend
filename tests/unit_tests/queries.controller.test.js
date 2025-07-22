const mockFindManyQuery = jest.fn();
const mockCreateQuery = jest.fn();
const mockFindManyRecord = jest.fn();

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      query: {
        findMany: mockFindManyQuery,
        create: mockCreateQuery,
      },
      record: {
        findMany: mockFindManyRecord,
      },
    })),
  };
});

const queryController = require('../../src/controllers/queries.controller');

describe('Query Controller', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = { body: {}, usuario: { id: 1 }, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('listQueries', () => {
    it('deve retornar lista de queries do usuário', async () => {
      const fakeQueries = [
        { id: 1, pergunta: 'P1', resposta: 'R1', criadoEm: new Date() },
        { id: 2, pergunta: 'P2', resposta: 'R2', criadoEm: new Date() },
      ];
      mockFindManyQuery.mockResolvedValue(fakeQueries);

      await queryController.listQueries(req, res);

      expect(mockFindManyQuery).toHaveBeenCalledWith({
        where: { usuarioId: 1 },
        orderBy: { criadoEm: 'desc' },
        select: { id: true, pergunta: true, resposta: true, criadoEm: true },
      });

      expect(res.json).toHaveBeenCalledWith(fakeQueries);
    });

    it('deve retornar 500 em caso de erro interno', async () => {
      mockFindManyQuery.mockRejectedValue(new Error('fail'));

      await queryController.listQueries(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao buscar as consultas anteriores.' });
    });
  });

  describe('createQuery', () => {
    it('deve retornar 400 se campos obrigatórios faltarem', async () => {
      req.body = { pergunta: '', datasetId: '' };

      await queryController.createQuery(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Campos "pergunta" e "datasetId" são obrigatórios.' });
    });

    it('deve retornar 404 se não houver registros no dataset', async () => {
      req.body = { pergunta: 'Qual é?', datasetId: 10 };
      mockFindManyRecord.mockResolvedValue([]);

      await queryController.createQuery(req, res);

      expect(mockFindManyRecord).toHaveBeenCalledWith({
        where: { datasetId: 10 },
        take: 10,
      });

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Nenhum dado encontrado neste dataset.' });
    });

    it('deve criar consulta e retornar registro', async () => {
      req.body = { pergunta: 'Qual é?', datasetId: 10 };

      const registrosMock = [
        { dadosJson: { campo: 'valor1' } },
        { dadosJson: { campo: 'valor2' } },
      ];
      mockFindManyRecord.mockResolvedValue(registrosMock);

      const createdQuery = { id: 5, pergunta: 'Qual é?', resposta: expect.any(String), usuarioId: 1 };
      mockCreateQuery.mockResolvedValue(createdQuery);

      await queryController.createQuery(req, res);

      expect(mockFindManyRecord).toHaveBeenCalledWith({
        where: { datasetId: 10 },
        take: 10,
      });

      expect(mockCreateQuery).toHaveBeenCalledWith({
        data: {
          pergunta: 'Qual é?',
          resposta: expect.any(String),
          usuarioId: 1,
        },
      });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(createdQuery);
    });

    it('deve retornar 500 em caso de erro interno', async () => {
      req.body = { pergunta: 'Qual é?', datasetId: 10 };
      mockFindManyRecord.mockRejectedValue(new Error('fail'));

      await queryController.createQuery(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao processar a consulta.' });
    });
  });
});

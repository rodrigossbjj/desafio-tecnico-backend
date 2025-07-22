const mockFindManyRecord = jest.fn();

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      record: {
        findMany: mockFindManyRecord,
      },
    })),
  };
});

const { searchRecords } = require('../../src/controllers/records.controller');

describe('searchRecords controller', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      query: {},
      usuario: { id: 1 },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('deve retornar 400 se query estiver ausente', async () => {
    req.query = {}; 
    await searchRecords(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Parâmetro "query" é obrigatório.' });
  });

  it('deve retornar registros filtrados conforme a query', async () => {
    req.query = { query: 'teste' };

    const recordsMock = [
      { dadosJson: { campo: 'teste de valor' }, dataset: { nome: 'dataset1' } },
      { dadosJson: { campo: 'outro valor' }, dataset: { nome: 'dataset2' } },
      { dadosJson: { campo: 'mais TESTE aqui' }, dataset: { nome: 'dataset3' } },
    ];

    mockFindManyRecord.mockResolvedValue(recordsMock);

    await searchRecords(req, res);

    expect(mockFindManyRecord).toHaveBeenCalledWith({
      where: {
        dataset: {
          usuarioId: 1,
        },
      },
      include: {
        dataset: true,
      },
    });

    expect(res.json).toHaveBeenCalledWith([
      { dadosJson: { campo: 'teste de valor' }, dataset: { nome: 'dataset1' } },
      { dadosJson: { campo: 'mais TESTE aqui' }, dataset: { nome: 'dataset3' } },
    ]);
  });

  it('deve retornar 500 em caso de erro interno', async () => {
    req.query = { query: 'qualquer' };
    mockFindManyRecord.mockRejectedValue(new Error('fail'));

    await searchRecords(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Erro na busca textual' });
  });
});

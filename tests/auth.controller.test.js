// tests/auth.controller.test.js

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Define o segredo antes de importar o controller
process.env.JWT_SECRET = 'segredo-test';

// Agora sim importa o controller
const { register, login } = require('../src/controllers/auth.controller');

// Mock do Prisma Client
const prisma = require('@prisma/client');
jest.mock('@prisma/client', () => {
  const mPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn()
    }
  };
  return { PrismaClient: jest.fn(() => mPrisma) };
});

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('Auth Controller', () => {
  let req, res, prismaClient;

  beforeEach(() => {
    prismaClient = new prisma.PrismaClient();
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('deve retornar erro se campos estiverem ausentes', async () => {
      req.body = {};
      await register(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        erro: 'Nome, e-mail e senha são obrigatórios.'
      });
    });

    it('deve retornar erro se o e-mail já estiver cadastrado', async () => {
      req.body = { nome: 'Ana', email: 'ana@email.com', senha: '123' };
      prismaClient.user.findUnique.mockResolvedValue({ id: 1 });
      await register(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        erro: 'E-mail já cadastrado.'
      });
    });

    it('deve criar novo usuário com sucesso', async () => {
      req.body = { nome: 'Ana', email: 'ana@email.com', senha: '123' };
      prismaClient.user.findUnique.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashed123');
      prismaClient.user.create.mockResolvedValue({ id: 1, nome: 'Ana' });

      await register(req, res);

      expect(bcrypt.hash).toHaveBeenCalledWith('123', 10);
      expect(prismaClient.user.create).toHaveBeenCalledWith({
        data: {
          nome: 'Ana',
          email: 'ana@email.com',
          senhaHash: 'hashed123'
        }
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        mensagem: 'Usuário registrado com sucesso.',
        usuario: { id: 1, nome: 'Ana' }
      });
    });
  });

  describe('login', () => {
    it('deve retornar erro se o usuário não existir', async () => {
      req.body = { email: 'nao@existe.com', senha: '123' };
      prismaClient.user.findUnique.mockResolvedValue(null);
      await login(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        erro: 'Credenciais inválidas.'
      });
    });

    it('deve retornar erro se a senha estiver incorreta', async () => {
      req.body = { email: 'ana@email.com', senha: 'errada' };
      prismaClient.user.findUnique.mockResolvedValue({
        id: 1,
        nome: 'Ana',
        senhaHash: 'hash123'
      });
      bcrypt.compare.mockResolvedValue(false);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        erro: 'Credenciais inválidas.'
      });
    });

    it('deve fazer login e retornar token', async () => {
      req.body = { email: 'ana@email.com', senha: 'correta' };
      prismaClient.user.findUnique.mockResolvedValue({
        id: 1,
        nome: 'Ana',
        senhaHash: 'hash123'
      });
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mocked-token');

      await login(req, res);

      expect(jwt.sign).toHaveBeenCalledWith(
        { id: 1, nome: 'Ana' },
        'segredo-test', // agora com valor correto
        { expiresIn: '2h' }
      );
      expect(res.json).toHaveBeenCalledWith({ token: 'mocked-token' });
    });
  });
});

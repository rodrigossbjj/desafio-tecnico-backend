const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'rodrigo'; // Melhor usar .env

// POST /auth/register
router.post('/register', async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: 'Nome, e-mail e senha são obrigatórios.' });
  }

  const existente = await prisma.user.findUnique({ where: { email } });
  if (existente) {
    return res.status(400).json({ erro: 'E-mail já cadastrado.' });
  }

  const senhaHash = await bcrypt.hash(senha, 10);

  const novoUsuario = await prisma.user.create({
    data: {
      nome,
      email,
      senhaHash
    }
  });

  res.status(201).json({ mensagem: 'Usuário registrado com sucesso.', usuario: { id: novoUsuario.id, nome: novoUsuario.nome } });
});

//POST /auth/login
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  const usuario = await prisma.user.findUnique({ where: { email } });
  if (!usuario) {
    return res.status(401).json({ erro: 'Credenciais inválidas.' });
  }

  const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);
  if (!senhaValida) {
    return res.status(401).json({ erro: 'Credenciais inválidas.' });
  }

  const token = jwt.sign({ id: usuario.id, nome: usuario.nome }, JWT_SECRET, {
    expiresIn: '2h'
  });

  res.json({ token });
});

module.exports = router;

const { getMe } = require('../../src/controllers/user.controller');

describe('User Controller - getMe', () => {
  it('deve retornar o usuário do request', () => {
    const req = {
      usuario: { id: 42, nome: 'Amanda' },
    };

    const res = {
      json: jest.fn(),
    };

    getMe(req, res);

    expect(res.json).toHaveBeenCalledWith({ usuario: { id: 42, nome: 'Amanda' } });
  });
});

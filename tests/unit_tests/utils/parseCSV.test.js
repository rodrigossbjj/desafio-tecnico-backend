const path = require('path');
const fs = require('fs');
const parseCSV = require('../../src/utils/parseCSV');

describe('parseCSV', () => {
  const arquivosMock = path.join(__dirname, 'mock_csv');

  beforeAll(() => {
    // Criar pasta mock_csv e arquivos temporários
    if (!fs.existsSync(arquivosMock)) fs.mkdirSync(arquivosMock);

    fs.writeFileSync(
      path.join(arquivosMock, 'valido.csv'),
      'nome,email\nJoão,joao@example.com\nMaria,maria@example.com'
    );

    fs.writeFileSync(
      path.join(arquivosMock, 'vazio.csv'),
      ''
    );
  });

  afterAll(() => {
    // Limpa arquivos após o teste
    fs.rmSync(arquivosMock, { recursive: true });
  });

  test('deve retornar objetos ao ler um CSV válido', async () => {
    const caminho = path.join(arquivosMock, 'valido.csv');
    const resultado = await parseCSV(caminho);

    expect(Array.isArray(resultado)).toBe(true);
    expect(resultado.length).toBe(2);
    expect(resultado[0]).toHaveProperty('nome', 'João');
    expect(resultado[0]).toHaveProperty('email', 'joao@example.com');
  });

  test('deve retornar array vazio ao ler CSV vazio', async () => {
    const caminho = path.join(arquivosMock, 'vazio.csv');
    const resultado = await parseCSV(caminho);

    expect(Array.isArray(resultado)).toBe(true);
    expect(resultado.length).toBe(0);
  });

  test('deve lançar erro se o arquivo não existir', async () => {
    const caminhoInvalido = path.join(arquivosMock, 'nao_existe.csv');
    await expect(parseCSV(caminhoInvalido)).rejects.toThrow();
  });
});

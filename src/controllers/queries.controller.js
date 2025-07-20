const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

//Função que simula uma resposta simples (Mock de IA)
function gerarRespostaMock(pergunta, dadosTexto) {
  const textoLower = dadosTexto.toLowerCase();

  if (textoLower.includes('relatório') || textoLower.includes('relatorio')) {
    return 'Baseado nos dados, parece que o conteúdo é um relatório.';
  }

  if (textoLower.includes('contrato')) {
    return 'Parece que o conteúdo dos dados é um contrato.';
  }

  if (textoLower.includes('fatura')) {
    return 'Os dados indicam que o conteúdo está relacionado a uma fatura.';
  }

  if (textoLower.includes('pedido')) {
    return 'Os dados mostram informações relacionadas a um pedido.';
  }

  //Resposta padrão se nenhuma palavra-chave for encontrada
  return `A IA identificou informações relevantes.`;
}


exports.createQuery = async (req, res) => {
  try {
    const { pergunta, datasetId } = req.body;
    const usuarioId = req.usuario.id;

    if (!pergunta || !datasetId) {
      return res.status(400).json({ error: 'Campos "pergunta" e "datasetId" são obrigatórios.' });
    }

    // Busca os primeiros 10 registros do dataset
    const records = await prisma.record.findMany({
      where: { datasetId },
      take: 10
    });

    if (records.length === 0) {
      return res.status(404).json({ error: 'Nenhum dado encontrado neste dataset.' });
    }

    // Monta texto base dos dados para usar no mock
    const dadosTexto = records.map((r, i) =>
      `Registro ${i + 1}: ${JSON.stringify(r.dadosJson)}`
    ).join('\n');

    // Gera resposta simulada
    const resposta = gerarRespostaMock(pergunta, dadosTexto);

    // Salva no banco
    const queryRegistro = await prisma.query.create({
      data: {
        pergunta,
        resposta,
        usuarioId
      }
    });

    res.status(201).json(queryRegistro);

  } catch (error) {
    console.error('Erro ao processar a consulta:', error);
    res.status(500).json({ error: 'Erro ao processar a consulta.' });
  }
};

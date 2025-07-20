const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


/* Em um caso real essa não é a melhor abordagem, 
   carregar em memória não é muito escalável
*/

exports.searchRecords = async (req, res) => {
  try {
    const query = req.query.query;
    const userId = req.usuario.id;

    //Só entra aqui caso seja feita a requisição errada
    if (!query) {
      return res.status(400).json({ error: 'Parâmetro "query" é obrigatório.' });
    }

    //Buscar todos os registros dos datasets do usuário
    const records = await prisma.record.findMany({
      where: {
        dataset: {
          usuarioId: userId
        }
      },
      include: {
        dataset: true //nome do dataset junto
      }
    });

    //Filtrar os registros que contenham a palavra-chave no JSON
    const resultados = records.filter(record =>
      JSON.stringify(record.dadosJson).toLowerCase().includes(query.toLowerCase())
    );

    res.json(resultados);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro na busca textual' });
  }
};

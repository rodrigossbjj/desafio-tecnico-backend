const fs = require('fs');
const csv = require('csv-parser');

// Função para converter um arquivo CSV em um array de objetos JSON
// Cada linha do CSV vira um objeto, onde as chaves são os cabeçalhos da primeira linha
function parseCSV(caminhoArquivo) {
  return new Promise((resolve, reject) => {
    const resultados = [];
    fs.createReadStream(caminhoArquivo)
      .pipe(csv())
      .on('data', (data) => resultados.push(data))
      .on('end', () => resolve(resultados))
      .on('error', (err) => reject(err));
  });
}

module.exports = parseCSV;
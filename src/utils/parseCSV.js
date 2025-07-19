const fs = require('fs');
const csv = require('csv-parser');

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
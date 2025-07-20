const express = require('express');
const app = express();

app.use(express.json());

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const dataSetsRoutes = require('./routes/datasets.routes');
const recordsRoutes = require('./routes/records.routes');
const queriesRoutes = require('./routes/queries.routes');

app.use('/auth', authRoutes);
app.use('/', userRoutes); // inclui o /me
app.use('/datasets', dataSetsRoutes);
app.use('/records', recordsRoutes);
app.use('/queries', queriesRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;

// GET /user/
exports.getMe = (req, res) => {
  // O middleware autenticarToken já garante que req.usuario existe
  res.json({ usuario: req.usuario });
};

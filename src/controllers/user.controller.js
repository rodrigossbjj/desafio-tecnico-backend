// GET /user/
exports.getMe = (req, res) => {
  res.json({ usuario: req.usuario });
};

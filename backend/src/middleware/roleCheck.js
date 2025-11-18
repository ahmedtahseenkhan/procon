module.exports = (roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role_name)) return res.status(403).json({ error: 'forbidden' });
  next();
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: `Role '${req.user.role}' is not authorized for this action.`,
        fields: null,
      },
    });
  }
  next();
};

module.exports = { authorize };

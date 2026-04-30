const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      error: { code: `DUPLICATE_${field.toUpperCase()}`, message: `${field} already exists`, fields: null },
    });
  }

  if (err.name === 'ValidationError') {
    const fields = {};
    Object.values(err.errors).forEach((e) => { fields[e.path] = e.message; });
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Validation failed', fields },
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_ID', message: 'Invalid resource identifier', fields: null },
    });
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Session expired. Please log in again.', fields: null },
    });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    error: { code: err.code || 'SERVER_ERROR', message: err.message || 'Unexpected error', fields: null },
  });
};

module.exports = errorHandler;

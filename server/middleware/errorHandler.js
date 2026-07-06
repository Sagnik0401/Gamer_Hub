const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: Object.values(err.errors).map(e => e.message).join(', ') });
  }
  if (err.code === 11000) {
    return res.status(409).json({ message: 'Duplicate field value', field: Object.keys(err.keyValue)[0] });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid resource identifier' });
  }

  res.status(err.statusCode || 500).json({ message: err.message || 'Internal server error' });
};

module.exports = errorHandler;

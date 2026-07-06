const mongoose = require('mongoose');

// Generic factory: checks req.user._id === document[ownerField]
const checkOwnership = (Model, ownerField = 'userId') => async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid resource id' });
  }

  const doc = await Model.findById(id);

  if (!doc) {
    return res.status(404).json({ message: 'Resource not found' });
  }

  if (doc[ownerField].toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Forbidden: not resource owner' });
  }

  req.resource = doc;
  next();
};

module.exports = { checkOwnership };

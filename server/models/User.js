const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20,
    match: /^[a-zA-Z0-9_]+$/
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^\S+@\S+\.\S+$/
  },
  passwordHash: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    default: '',
    trim: true,
    maxlength: 300
  },
  preferredPlatforms: {
    type: [String],
    enum: ['PC', 'PlayStation', 'Xbox', 'Switch'],
    default: []
  },
  followers:        { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
  following:        { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
  savedPosts:       { type: [mongoose.Schema.Types.ObjectId], ref: 'Post', default: [] },
  favoriteChannels: { type: [String], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);

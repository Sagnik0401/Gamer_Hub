const mongoose = require('mongoose');
const { Schema } = mongoose;

const CommentSchema = new Schema({
  postId: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true,
    maxlength: 2000
  }
}, { timestamps: true });

module.exports = mongoose.model('Comment', CommentSchema);

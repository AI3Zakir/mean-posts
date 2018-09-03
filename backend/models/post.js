const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  imagePath: { type: String, required: true },
  user: { type: mongoose.Schema.ObjectId, ref: "User", required: true }
});

module.exports = mongoose.model('Post', postSchema);

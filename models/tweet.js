const mongoose = require("mongoose");

const tweetSchema = new mongoose.Schema({
  authorId: { type: String, required: true },
  created_at: { type: Date, default: Date.now() },
  updated_at: { type: Date, default: Date.now() },
  text: { type: String, required: true },
  likes: { type: Number, default: 0 },
  retweet: { type: Boolean, default: false },
  retweet_count: { type: Number, default: 0 },
});

module.exports = mongoose.model("tweet", tweetSchema);

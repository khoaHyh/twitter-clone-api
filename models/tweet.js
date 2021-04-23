const mongoose = require("mongoose");

const tweetSchema = new mongoose.Schema({
  authorId: { type: String, required: true },
  created_at: { type: Date, default: Date.now() },
  updated_at: { type: Date, default: Date.now() },
  text: { type: String, required: true },
  likes: { type: Number, default: 0 },
  retweet_count: { type: Number, default: 0 },
  reply_to: mongoose.Schema.Types.ObjectId,
  thread: [
    {
      created_timestamp: { type: Date, default: Date.now() },
    },
  ],
});

module.exports = mongoose.model("tweet", tweetSchema);

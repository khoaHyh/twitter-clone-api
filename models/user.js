const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, dropDups: true },
  password: { type: String, required: true },
  created: { type: Date, default: Date.now },
  likes: [
    {
      created_timestamp: { type: Date, default: Date.now() },
      tweetId: { type: String, required: true },
    },
  ],
});

module.exports = mongoose.model("user", userSchema);

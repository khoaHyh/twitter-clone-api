const mongoose = require("mongoose");

const directMessageSchema = new mongoose.Schema({
  recipientId: { type: String, required: true },
  senderId: { type: String, required: true },
  conversation: [
    {
      created_timestamp: { type: Date, default: Date.now() },
      tweetId: { type: String, required: true },
    },
  ],
});

module.exports = mongoose.model("directMessage", directMessageSchema);

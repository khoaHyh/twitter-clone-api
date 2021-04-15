const mongoose = require("mongoose");

const directMessageSchema = new mongoose.Schema({
  conversation: [
    {
      recipientId: String,
      senderId: String,
      created_timestamp: String,
      text: String,
    },
  ],
});

module.exports = mongoose.model("directMessage", directMessageSchema);

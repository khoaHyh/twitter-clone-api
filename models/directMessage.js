const mongoose = require("mongoose");

const directMessageSchema = new mongoose.Schema({
  type: String,
  conversation: [
    {
      message: String,
      created_timestamp: String,
      sender: String,
    },
  ],
});

module.exports = mongoose.model("directMessage", directMessageSchema);

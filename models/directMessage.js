const mongoose = require("mongoose");

const directMessageSchema = new mongoose.Schema({
  type: String,
  create_timestamp: String,
  chat: [
    {
      message: String,
      timestamp: String, // client would set timestamp in this API
      sender: String,
    },
  ],
});

module.exports = mongoose.model("directMessage", directMessageSchema);

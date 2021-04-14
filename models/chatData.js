const mongoose = require("mongoose");

const chatDataSchema = new mongoose.Schema({
  chat: [
    {
      message: String,
      timestamp: String, // client would set timestamp in this API
      sender: String,
    },
  ],
});

module.exports = mongoose.model("chatData", chatDataSchema);

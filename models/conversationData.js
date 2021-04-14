const mongoose = require("mongoose");

const conversationDataSchema = new mongoose.Schema({
  conversation: [
    {
      message: String,
      timestamp: String, // client would set timestamp in this API
      sender: String,
    },
  ],
});

module.exports = mongoose.model("conversationData", conversationDataSchema);

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, dropDups: true },
  password: { type: String },
  joined: { type: Date, default: new Date() },
});

module.exports = mongoose.model("user", userSchema);

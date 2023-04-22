const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const User = new Schema({
  id: String,
  username: String,
  password: String,
  email: String,
  entries: Number,
  joined: Date,
});

module.exports = mongoose.model("user", User);

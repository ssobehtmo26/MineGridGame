const mongoose = require("mongoose");
const User = require("./UserSchema");

const gameSchema = new mongoose.Schema({
  gameState: {
    type: {},
    required: true,
  },
  userlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
      required: true,
    },
  ],
  result: {
    type: String,
    default: "",
  },
  turn: {
    type: String,
    default: "",
  },
});

module.exports = mongoose.model("Game", gameSchema);

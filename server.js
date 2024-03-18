const mongoose = require("mongoose");
const dotenv = require("dotenv");
const MineGame = require("./game");

dotenv.config();

const uri = process.env.URI;

mongoose
  .connect(uri)
  .then(async () => {
    await MineGame();
  })
  .catch((e) => {
    console.error(e);
  });

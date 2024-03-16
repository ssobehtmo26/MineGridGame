const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");

const MineGame = require("../game");

const app = express();

const server = http.createServer(app);

const io = new Server(server);

const uri =
  "mongodb+srv://writetoom2003:RobylonAssignmentOm@assignmentrobylon.fh41adb.mongodb.net/?retryWrites=true&w=majority&appName=assignmentRobylon";

const connect = async () => {
  try {
    await mongoose.connect(uri);
    console.log("Connected to mongoDB");
  } catch (error) {
    console.error(error);
  }
};

connect();

server.listen(5000, () => {
  console.log("Server started on port 5000");
});

MineGame();

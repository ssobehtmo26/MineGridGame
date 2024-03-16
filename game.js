const prompt = require("prompt-sync")();
const Game = require("./models/GameSchema");
const User = require("./models/UserSchema");
const socket = io();

const MineGame = () => {
  const timeout = (ms = 1000) => new Promise((r) => setTimeout(r, ms));

  const welcome = async () => {
    await timeout();
    console.log(`
    Welcome to Mine or Gem, where you and your opponent take turns picking tiles from a 5x5 grid. 
    One tile hides a mine, the rest hold gems. 
    Your goal: lead your opponent to the mine while avoiding it yourself. 
    Let the game of strategy and suspense begin!
    `);
  };

  let grid = [];

  const createGrid = () => {
    for (let i = 0; i < 5; i++) {
      grid[i] = [];
      for (let j = 0; j < 5; j++) {
        grid[i][j] = "*";
      }
    }
  };

  const start = async () => {
    createGrid();
    let newgrid;
    let createGame;
    let winner;
    let p1,
      p2,
      u1,
      u2,
      num = 1;

    const play = prompt(
      "Enter 'N' to create new game or Enter 'J' to join game: "
    );
    if (play == "J") {
      const gameId = prompt("Enter game ID: ");

      let joingame = await Game.findById(gameId).exec();

      if (joingame.userlist.length == 2)
        console.log("You cannot join this game already has 2 players");
      else if (joingame.userlist.length == 1) {
        p2 = prompt("Enter player 2 name: ");

        await welcome();

        u2 = await User.create({
          username: p2,
        });

        joingame.userlist.push(u2);

        u1 = joingame.userlist[0];
        p1 = await User.findById(u1).exec();
        p1 = p1.username;

        createGame = await Game.findByIdAndUpdate(
          id,
          { $set: { userlist: joingame.userlist, gameState: grid } },
          { new: true }
        );
      }
    } else {
      p1 = prompt("Enter player 1 name: ");
      p2 = prompt("Enter player 2 name: ");

      await welcome();

      const u = await User.create(
        {
          username: p1,
        },
        {
          username: p2,
        }
      );

      createGame = await Game.create({
        gameState: grid,
        userlist: u,
      });

      console.log("Game ID: ", createGame._id);
    }
    while (num) {
      createGrid();

      const mx = Math.floor(Math.random() * 4.99);
      const my = Math.floor(Math.random() * 4.99);
      let x, y;
      let round = 1;
      let currplayer = p1;

      newgrid = await Game.findByIdAndUpdate(
        createGame._id,
        { $set: { turn: p1, gameState: grid } },
        { new: true }
      );
      console.log(newgrid.gameState);

      while (round < 25) {
        const index = prompt("Choose desired tile: ").split(",");
        a = index[0];
        b = index[1];
        x = a - 1;
        y = b - 1;

        if (x == mx && y == my) {
          grid[x][y] = "!";

          if (round % 2 == 0) winner = p1;
          else winner = p2;

          newgrid = await Game.findByIdAndUpdate(
            createGame._id,
            { $set: { gameState: grid, result: winner } },
            { new: true }
          );
          console.log(newgrid.gameState);
          break;
        } else {
          if (round % 2 == 0) grid[x][y] = "o";
          else grid[x][y] = "x";
        }

        round++;
        if (round % 2 == 0) currplayer = p2;
        else currplayer = p1;

        newgrid = await Game.findByIdAndUpdate(
          createGame._id,
          { $set: { gameState: grid, turn: currplayer } },
          { new: true }
        );

        console.log(newgrid.gameState);
      }

      if (round == 25) {
        console.log("the game ended in a draw");
        console.log(`the mine was present in ${mx}, ${my}`);
      } else console.log(`Player ${winner} wins!!!`);

      let playAgain = prompt("Enter 'P' to play again or 'E' to exit: ");
      if (playAgain == "E") num--;
    }
  };

  start();
};

module.exports = MineGame;

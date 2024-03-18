const prompt = require("prompt-sync")();
const Game = require("./models/GameSchema");
const User = require("./models/UserSchema");

const MineGame = async () => {
  let grid = [];
  let newgrid;
  let createGame;
  let winner;
  let player1, player2, user1, user2, users;

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

  printArr = (array) => {
    for (let row of array) {
      console.log(row.join(" "));
    }
  };

  const createGrid = () => {
    for (let i = 0; i < 5; i++) {
      grid[i] = [];
      for (let j = 0; j < 5; j++) {
        grid[i][j] = "*";
      }
    }
  };
  // handling input of player names and game creation
  const handlePlayerInput = async () => {
    createGrid();
    let play = prompt("Enter 'N' to create new game or 'J' to join game: ");
    while (true) {
      if (play == "J") {
        while (true) {
          let gameId = prompt("Enter game ID: ");

          let joingame = await Game.findById(gameId).exec();

          while (true) {
            if (joingame !== null && joingame !== undefined) break;
            gameId = prompt("Enter valid game ID: ");
          }

          if (joingame.userlist.length == 2)
            console.log("You cannot join this game already has 2 players");
          else if (joingame.userlist.length == 1) {
            while (true) {
              player2 = prompt("Enter player 2 name: ");
              if (player2 !== "" && player2 !== null) break;
            }

            await welcome();

            user2 = await User.create({
              username: player2,
            });

            joingame.userlist.push(user2);

            user1 = joingame.userlist[0];
            player1 = await User.findById(user1).exec();
            player1 = player1.username;

            createGame = await Game.findByIdAndUpdate(
              gameId,
              { $set: { userlist: joingame.userlist, gameState: grid } },
              { new: true }
            );
          }
          break;
        }
      } else if (play == "N") {
        while (true) {
          player1 = prompt("Enter player 1 name: ");
          if (player1 !== "" && player1 !== null) break;
        }

        while (true) {
          player2 = prompt("Enter player 2 name: ");
          if (player2 !== "" && player2 !== null) break;
        }

        await welcome();

        users = await User.create(
          {
            username: player1,
          },
          {
            username: player2,
          }
        );

        createGame = await Game.create({
          gameState: grid,
          userlist: users,
        });

        console.log("Game ID: ", createGame._id.toString());

        break;
      } else {
        play = prompt(
          "Invalid input. Please enter either 'N' to create new game or 'J' to join game: "
        );
      }
    }
  };
  // this function contains the random mine generation and game logic
  const GameLogic = async () => {
    const inputRegex = /^[1-5]$/;
    while (true) {
      createGrid();

      let mx = Math.floor(Math.random() * 4.99);
      let my = Math.floor(Math.random() * 4.99);
      let x, y;
      let round = 1;
      let currplayer = player1;

      newgrid = await Game.findByIdAndUpdate(
        createGame._id,
        { $set: { turn: player1, gameState: grid } },
        { new: true }
      );
      printArr(newgrid.gameState);

      while (round < 25) {
        let index;
        while (true) {
          index = prompt(`${currplayer}, enter desired tile: `);
          if (index !== null) {
            index = index.split(/[,\s]+/);
            break;
          }
        }

        let a = index[0];
        let b = index[1];

        if (
          !inputRegex.test(a) ||
          !inputRegex.test(b) ||
          index.length != 2 ||
          grid[a - 1][b - 1] != "*"
        ) {
          while (true) {
            if (
              !inputRegex.test(a) ||
              !inputRegex.test(b) ||
              index.length != 2 ||
              index === null
            ) {
              index = prompt(
                `${currplayer}, please enter valid index for tile: `
              );
              if (index !== null) {
                index = index.split(/[,\s]+/);
                a = index[0];
                b = index[1];
              }
            } else if (grid[a - 1][b - 1] != "*") {
              index = prompt(
                `${currplayer}, that tile has already been opened. Please enter another tile: `
              );
              if (index !== null) {
                index = index.split(/[,\s]+/);
                a = index[0];
                b = index[1];
              }
            }
            if (
              inputRegex.test(a) &&
              inputRegex.test(b) &&
              index.length == 2 &&
              grid[a - 1][b - 1] == "*" &&
              index !== null
            ) {
              break;
            }
          }
        }

        x = a - 1;
        y = b - 1;

        if (x == mx && y == my) {
          grid[x][y] = "!";

          if (round % 2 == 0) winner = player1;
          else winner = player2;

          newgrid = await Game.findByIdAndUpdate(
            createGame._id,
            { $set: { gameState: grid, result: winner } },
            { new: true }
          );
          console.clear();
          printArr(newgrid.gameState);
          break;
        } else {
          if (round % 2 == 0) grid[x][y] = "o";
          else grid[x][y] = "x";
        }

        round++;
        if (round % 2 == 0) currplayer = player2;
        else currplayer = player1;

        newgrid = await Game.findByIdAndUpdate(
          createGame._id,
          { $set: { gameState: grid, turn: currplayer } },
          { new: true }
        );

        console.clear();
        printArr(newgrid.gameState);
      }

      if (round == 25) {
        console.log("the game ended in a draw");
        console.log(`the mine was present in ${mx}, ${my}`);
      } else {
        console.log(`Player ${winner} wins!!!`);
      }

      let playAgain = prompt("Enter 'P' to play again or 'E' to exit: ");
      while (true) {
        if (playAgain == "E" || playAgain == "P") break;
        else {
          playAgain = prompt(
            "Invalid input. Please enter 'P' to play again or 'E' to exit: "
          );
        }
      }
      if (playAgain == "E") {
        console.log("exiting...");
        process.exit();
        break;
      }
      console.clear();
    }
  };
  // execution of the game
  const start = async () => {
    await handlePlayerInput();
    await GameLogic();
  };

  await start();
};

module.exports = MineGame;

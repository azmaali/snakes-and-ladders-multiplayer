// Making Connection
const socket = io.connect("http://localhost:3000");
socket.emit("joined", "");

// const sleep = (milliseconds) => {
//   return new Promise((resolve) => setTimeout(resolve, milliseconds));
// };

let player;

const COMP1 = 0;
const COMP2 = 1;
let playerPos = 0;
let compPos = 0;
let turn = COMP1;

let canvas = document.getElementById("canvas");
canvas.width = document.documentElement.clientHeight * 0.9;
canvas.height = document.documentElement.clientHeight * 0.9;
let ctx = canvas.getContext("2d");

let redPieceImg = document.getElementById("red-piece");
let bluePieceImg = document.getElementById("blue-piece");

const side = canvas.width / 10;
const offsetX = side / 2;
const offsetY = side / 2 + 20;
let interval;

const ladders = [
  [2, 23],
  [4, 68],
  [6, 45],
  [20, 59],
  [30, 96],
  [52, 72],
  [57, 96],
  [71, 92],
];

const snakes = [
  [98, 40],
  [84, 58],
  [87, 49],
  [73, 15],
  [56, 8],
  [50, 5],
  [43, 17],
];

var imgs = document.images,
  len = imgs.length,
  counter = 0;

[].forEach.call(imgs, function (img) {
  if (img.complete) incrementCounter();
  else img.addEventListener("load", incrementCounter, false);
});

document.getElementById("start-btn").addEventListener("click", () => {
  player = document.getElementById("name").value;
  console.log(player);
  document.getElementById("name").disabled = true;
  document.getElementById("start-btn").hidden = true;
  socket.emit("join", {
    name: player,
  });
});

function incrementCounter() {
  counter++;
  if (counter === len) {
    console.log("All images loaded!");
    // interval = setInterval(game, 1000);
    // ctx.drawImage(bluePieceImg,40,canvas.height-50,30,40);
    drawPin(redPieceImg, playerPos);
    drawPin(bluePieceImg, compPos);
    interval = setInterval(game, 3000);
  }
}

document.getElementById("roll-button").addEventListener("click", () => {
  const num = rollDice();
  socket.emit("rollDice", {
    num: num,
  });
});

function rollDice() {
  const number = Math.ceil(Math.random() * 6);
  document.getElementById("dice").src = `./images/dice/dice${number}.png`;
  return number;
}

function isLadderOrSnake(pos) {
  let newPos = pos;

  for (let i = 0; i < ladders.length; i++) {
    if (ladders[i][0] == pos) {
      console.log(ladders[i][0] + " " + ladders[i][1]);
      newPos = ladders[i][1];
      break;
    }
  }

  for (let i = 0; i < snakes.length; i++) {
    if (snakes[i][0] == pos) {
      console.log(snakes[i][0] + " " + snakes[i][1]);
      newPos = snakes[i][1];
      break;
    }
  }

  return newPos;
}

function game() {
  // if (playerPos == 99 || compPos == 99) {
  //   clearInterval(interval);
  // }

  // while (playerPos != 99 && compPos != 99) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let num = rollDice();
  socket.emit("dice-roll", {
    value: num,
    player: 0,
    newPosition: 1,
  });
  if (turn == COMP1) {
    if (playerPos + num - 99 <= 0) {
      playerPos += num;
      playerPos = isLadderOrSnake(playerPos + 1) - 1;
      drawPin(redPieceImg, playerPos);
      drawPin(bluePieceImg, compPos);
      turn = COMP2;
    } else clearInterval(interval);
  } else if (turn == COMP2) {
    if (compPos + num - 99 <= 0) {
      compPos += num;
      compPos = isLadderOrSnake(compPos + 1) - 1;
      drawPin(redPieceImg, playerPos);
      drawPin(bluePieceImg, compPos);
      turn = COMP1;
    } else clearInterval(interval);
  }
  // }
}

function drawPin(img, pos) {
  let xPos =
    Math.floor(pos / 10) % 2 == 0
      ? (pos % 10) * side - 15 + offsetX
      : canvas.width - ((pos % 10) * side + offsetX + 15);
  let yPos = canvas.height - (Math.floor(pos / 10) * side + offsetY);

  ctx.drawImage(img, xPos, yPos, 30, 40);
}

// Listen for events
socket.on("join", (data) => {
  document.getElementById("players-box").innerHTML += `<p>${data.name}</p>`;
});

socket.on("joined", (data) => {
  data.forEach(
    (player) =>
      (document.getElementById(
        "players-box"
      ).innerHTML += `<p>${player.name}</p>`)
  );
});

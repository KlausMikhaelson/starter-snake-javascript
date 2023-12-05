import runServer from "./server.js";

function info() {
  console.log("INFO");

  return {
    apiversion: "1",
    author: "YourUsername", // TODO: Your Battlesnake Username
    color: "#888888", // TODO: Choose color
    head: "default", // TODO: Choose head
    tail: "default", // TODO: Choose tail
  };
}

function start(gameState) {
  console.log("GAME START");
}

function end(gameState) {
  console.log("GAME OVER\n");
}

function move(gameState) {
  let isMoveSafe = {
    up: true,
    down: true,
    left: true,
    right: true,
  };

  const myHead = gameState.you.body[0];
  const myNeck = gameState.you.body[1];

  if (myNeck.x < myHead.x) {
    isMoveSafe.left = false;
  } else if (myNeck.x > myHead.x) {
    isMoveSafe.right = false;
  } else if (myNeck.y < myHead.y) {
    isMoveSafe.down = false;
  } else if (myNeck.y > myHead.y) {
    isMoveSafe.up = false;
  }

  const boardWidth = gameState.board.width;
  const boardHeight = gameState.board.height;
  const myBody = gameState.you.body;
  const opponents = gameState.board.snakes;
  const food = gameState.board.food;

  // Step 1 - Prevent your Battlesnake from moving out of bounds
  if (myHead.x === 0) {
    isMoveSafe.left = false;
  } else if (myHead.x === boardWidth - 1) {
    isMoveSafe.right = false;
  }

  if (myHead.y === 0) {
    isMoveSafe.down = false;
  } else if (myHead.y === boardHeight - 1) {
    isMoveSafe.up = false;
  }

  // Step 2 - Prevent your Battlesnake from colliding with itself
  for (const bodyPart of myBody.slice(1)) {
    if (bodyPart.x === myHead.x - 1) isMoveSafe.left = false;
    if (bodyPart.x === myHead.x + 1) isMoveSafe.right = false;
    if (bodyPart.y === myHead.y - 1) isMoveSafe.down = false;
    if (bodyPart.y === myHead.y + 1) isMoveSafe.up = false;
  }

  // Step 3 - Prevent your Battlesnake from colliding with other Battlesnakes
  for (const snake of opponents) {
    for (const bodyPart of snake.body) {
      if (bodyPart.x === myHead.x - 1) isMoveSafe.left = false;
      if (bodyPart.x === myHead.x + 1) isMoveSafe.right = false;
      if (bodyPart.y === myHead.y - 1) isMoveSafe.down = false;
      if (bodyPart.y === myHead.y + 1) isMoveSafe.up = false;
    }
  }

  // Are there any safe moves left?
  const safeMoves = Object.keys(isMoveSafe).filter((key) => isMoveSafe[key]);
  if (safeMoves.length == 0) {
    console.log(`MOVE ${gameState.turn}: No safe moves detected! Moving down`);
    return { move: "down" };
  }

  // Step 4 - Move towards food instead of random, to regain health and survive longer
  const closestFood = findClosestFood(myHead, food);
  const nextMove = determineNextMove(myHead, closestFood, isMoveSafe);

  console.log(`MOVE ${gameState.turn}: ${nextMove}`);
  return { move: nextMove };
}

function findClosestFood(head, food) {
  let closestFood = food[0];
  let minDistance = calculateDistance(head, closestFood);

  for (const foodItem of food) {
    const distance = calculateDistance(head, foodItem);
    if (distance < minDistance) {
      minDistance = distance;
      closestFood = foodItem;
    }
  }

  return closestFood;
}

function calculateDistance(point1, point2) {
  return Math.abs(point1.x - point2.x) + Math.abs(point1.y - point2.y);
}

function determineNextMove(head, target, isMoveSafe) {
  const possibleMoves = [];

  if (head.x < target.x && isMoveSafe.right) {
    possibleMoves.push("right");
  } else if (head.x > target.x && isMoveSafe.left) {
    possibleMoves.push("left");
  } else if (head.y < target.y && isMoveSafe.up) {
    possibleMoves.push("up");
  } else if (head.y > target.y && isMoveSafe.down) {
    possibleMoves.push("down");
  }

  return possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
}

runServer({
  info: info,
  start: start,
  move: move,
  end: end,
});

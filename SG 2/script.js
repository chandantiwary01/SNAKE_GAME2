const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const box = 20;
const rows = canvas.width / box;

let snake = [{ x: 10 * box, y: 10 * box }];
let direction = "RIGHT";
let score = 0;
let gameInterval = null;
let running = false;

let food = {};
let hazards = [];

const eatSound = document.getElementById("eatSound");
const gameOverSound = document.getElementById("gameOverSound");

document.getElementById("startBtn").addEventListener("click", startGame);
document.getElementById("pauseBtn").addEventListener("click", togglePause);
document.getElementById("restartBtn").addEventListener("click", restartGame);

document.addEventListener("keydown", changeDirection);

function startGame() {
  if (!running) {
    spawnFood();
    spawnHazards();
    gameInterval = setInterval(draw, 100);
    running = true;
  }
}

function togglePause() {
  if (running) {
    clearInterval(gameInterval);
    running = false;
  } else {
    gameInterval = setInterval(draw, 100);
    running = true;
  }
}

function restartGame() {
  clearInterval(gameInterval);
  snake = [{ x: 10 * box, y: 10 * box }];
  direction = "RIGHT";
  score = 0;
  document.getElementById("score").innerText = score;
  hazards = [];
  spawnFood();
  spawnHazards();
  gameInterval = setInterval(draw, 100);
  running = true;
}

function changeDirection(e) {
  if (e.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
  else if (e.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
  else if (e.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
  else if (e.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
}

function spawnFood() {
  let x, y;
  do {
    x = Math.floor(Math.random() * rows) * box;
    y = Math.floor(Math.random() * rows) * box;
  } while (snake.some(s => s.x === x && s.y === y));
  food = { x, y };
}

function spawnHazards() {
  hazards = [];
  for (let i = 0; i < 5; i++) {
    hazards.push({
      x: Math.floor(Math.random() * rows) * box,
      y: Math.floor(Math.random() * rows) * box,
    });
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw snake
  for (let i = 0; i < snake.length; i++) {
    const gradient = ctx.createLinearGradient(0, 0, box, box);
    gradient.addColorStop(0, i === 0 ? "#0f0" : "#033");
    gradient.addColorStop(1, "#0b0");
    ctx.fillStyle = gradient;
    ctx.fillRect(snake[i].x, snake[i].y, box, box);
  }

  // Draw food
  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, box, box);

  // Draw hazards
  ctx.fillStyle = "#555";
  hazards.forEach(h => {
    ctx.beginPath();
    ctx.arc(h.x + box/2, h.y + box/2, box / 2.5, 0, 2 * Math.PI);
    ctx.fill();
  });

  // Snake movement
  let head = { ...snake[0] };
  if (direction === "LEFT") head.x -= box;
  else if (direction === "RIGHT") head.x += box;
  else if (direction === "UP") head.y -= box;
  else if (direction === "DOWN") head.y += box;

  // Collision
  if (
    head.x < 0 || head.y < 0 ||
    head.x >= canvas.width || head.y >= canvas.height ||
    snake.some(s => s.x === head.x && s.y === head.y) ||
    hazards.some(h => h.x === head.x && h.y === head.y)
  ) {
    clearInterval(gameInterval);
    running = false;
    gameOverSound.play();
    flashGameOver();
    return;
  }

  snake.unshift(head);

  // Eating food
  if (head.x === food.x && head.y === food.y) {
    score++;
    document.getElementById("score").innerText = score;
    eatSound.play();
    spawnFood();
  } else {
    snake.pop();
  }
}

function flashGameOver() {
  canvas.style.boxShadow = "0 0 20px red";
  setTimeout(() => {
    canvas.style.boxShadow = "0 0 10px #0f0";
  }, 300);
}

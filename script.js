var playButton = document.getElementById('playButton')
var resetButton = document.getElementById('resetButton')
var pauseButton = document.getElementById('pauseButton')
var resumeButton = document.getElementById('resumeButton')
var mainBox = document.getElementById('main-box')
var gameBox = document.getElementById('game-box')
var levelSelect = document.getElementById('level')

var gamePaused = false
var animationFrameId
var snakeSpeed = 200

playButton.addEventListener('click', function () {
  mainBox.style.opacity = '0'
  mainBox.style.transform = 'translateX(-50%) scale(0.95)'

  setTimeout(function () {
    mainBox.style.display = 'none'
    gameBox.style.display = 'flex'
    gameBox.style.opacity = '1'
    gameBox.style.transform = 'translateX(-50%) scale(1)'

    setTimeout(function () {
      resetGame()
    }, 500)
  }, 500)
})

resetButton.addEventListener('click', function () {
  gamePaused = true
  cancelAnimationFrame(animationFrameId)
  gameBox.style.opacity = '0'
  gameBox.style.transform = 'translateX(-50%) scale(0.95)'

  setTimeout(function () {
    gameBox.style.display = 'none'
    mainBox.style.display = 'flex'
    mainBox.style.opacity = '1'
    mainBox.style.transform = 'translateX(-50%) scale(1)'
    cancelAnimationFrame(animationFrameId)
  }, 500)
})

pauseButton.addEventListener('click', function () {
  if (!gamePaused) {
    gamePaused = true
    cancelAnimationFrame(animationFrameId)
    pauseButton.disabled = true
    resumeButton.disabled = false
  }
})

resumeButton.addEventListener('click', function () {
  if (gamePaused) {
    gamePaused = false
    resumeButton.disabled = true
    pauseButton.disabled = false
    gameLoop()
  }
})

const gridSize = 20
const snakeColor = '#2ecc71'
const initialSnakeLength = 1

const canvas = document.getElementById('gameCanvas')
const ctx = canvas.getContext('2d')

let snake = []
let snakeDirection = 'right'
let food = { x: 0, y: 0 }

function getSpeedFromLevel(level) {
  switch (level) {
    case 'Easy':
      return 400
    case 'Normal':
      return 300
    case 'Intermediate':
      return 200
    case 'Hard':
      return 100
    case 'Expert':
      return 50
  }
}

function initializeSnake() {
  snake = []
  for (let i = 0; i < initialSnakeLength; i++) {
    snake.push({ x: i, y: 0 })
  }
  snakeDirection = 'right'
  generateFood()
}

function drawSnake() {
  ctx.fillStyle = snakeColor
  snake.forEach((segment) => {
    ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize)
  })
}

function updateSnake() {
  let newHead = { x: snake[0].x, y: snake[0].y }
  switch (snakeDirection) {
    case 'up':
      newHead.y -= 1
      break
    case 'down':
      newHead.y += 1
      break
    case 'left':
      newHead.x -= 1
      break
    case 'right':
      newHead.x += 1
      break
  }

  if (newHead.x === food.x && newHead.y === food.y) {
    generateFood()
  } else {
    snake.pop()
  }

  snake.unshift(newHead)
}

document.addEventListener('keydown', function (event) {
  if ([37, 38, 39, 40].includes(event.keyCode)) {
    event.preventDefault()
  }
  switch (event.keyCode) {
    case 37:
      if (snakeDirection !== 'right') snakeDirection = 'left'
      break
    case 38:
      if (snakeDirection !== 'down') snakeDirection = 'up'
      break
    case 39:
      if (snakeDirection !== 'left') snakeDirection = 'right'
      break
    case 40:
      if (snakeDirection !== 'up') snakeDirection = 'down'
      break
  }
})

function checkCollision() {
  if (
    snake[0].x < 0 ||
    snake[0].y < 0 ||
    snake[0].x >= canvas.width / gridSize ||
    snake[0].y >= canvas.height / gridSize
  ) {
    return true
  }

  for (let i = 1; i < snake.length; i++) {
    if (snake[0].x === snake[i].x && snake[0].y === snake[i].y) {
      snake = snake.slice(0, i)
      drawScore()
      return false
    }
  }

  return false
}

function gameLoop() {
  if (!gamePaused) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    updateSnake()
    drawSnake()
    drawFood()
    drawFood()
    drawFood()
    drawScore()
    drawLevel()

    if (checkCollision()) {
      gameOver()
      return
    }

    setTimeout(function () {
      animationFrameId = requestAnimationFrame(gameLoop)
    }, snakeSpeed)
  }
}

function resetGame() {
  initializeSnake()
  gamePaused = false
  snakeSpeed = getSpeedFromLevel(levelSelect.value)
  animationFrameId = requestAnimationFrame(gameLoop)
  pauseButton.disabled = false
  resumeButton.disabled = true
}

function generateFood() {
  food = {
    x: Math.floor(Math.random() * (canvas.width / gridSize)),
    y: Math.floor(Math.random() * (canvas.height / gridSize)),
  }
  for (let i = 0; i < snake.length; i++) {
    if (food.x === snake[i].x && food.y === snake[i].y) {
      generateFood()
      return
    }
  }
}

function drawFood() {
  ctx.fillStyle = '#e74c3c'
  ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize)
}

function drawScore() {
  ctx.fillStyle = '#fff'
  ctx.font = '20px Arial'
  ctx.fillText('Score: ' + (snake.length - initialSnakeLength), 10, 30)
}

function drawLevel() {
  ctx.fillStyle = '#fff'
  ctx.font = '20px Arial'
  ctx.fillText('Level: ' + levelSelect.value, 200, 30)
}

function gameOver() {
  gamePaused = true
  cancelAnimationFrame(animationFrameId)
  const score = snake.length - initialSnakeLength
  const level = levelSelect.value
  updateLeaderboard(score, level)
  const playAgain = confirm(
    `Game Over! Your score: ${score}\nDo you want to play again?`
  )

  if (playAgain) {
    resetGame()
  } else {
    gameBox.style.display = 'none'
    mainBox.style.display = 'flex'
    mainBox.style.opacity = '1'
    mainBox.style.transform = 'translateX(-50%) scale(1)'
    cancelAnimationFrame(animationFrameId)
  }
}

function updateLeaderboard(score, level) {
  const name = document.getElementById('userName').value
  const leaderboard =
    JSON.parse(localStorage.getItem('snakeGameLeaderboard')) || []

  const existingEntryIndex = leaderboard.findIndex(
    (entry) => entry.name === name && entry.level === level
  )

  if (existingEntryIndex !== -1) {
    leaderboard[existingEntryIndex].score = score
  } else {
    leaderboard.push({ name, score, level })
  }

  leaderboard.sort((a, b) => {
    const levelOrder = ['Expert', 'Hard', 'Intermediate', 'Normal', 'Easy']
    const levelA = levelOrder.indexOf(a.level)
    const levelB = levelOrder.indexOf(b.level)

    if (levelA !== levelB) {
      return levelA - levelB
    } else {
      return b.score - a.score
    }
  })

  const top10Leaderboard = leaderboard.slice(0, 10)
  localStorage.setItem('snakeGameLeaderboard', JSON.stringify(top10Leaderboard))
  displayLeaderboard()
}

function displayLeaderboard() {
  const leaderboard =
    JSON.parse(localStorage.getItem('snakeGameLeaderboard')) || []
  const leaderboardBody = document.getElementById('leaderboardBody')
  leaderboardBody.innerHTML = ''

  let userEntry = null
  const name = document.getElementById('userName').value

  for (let index = 0; index < 10 && index < leaderboard.length; index++) {
    const entry = leaderboard[index]
    const row = createLeaderboardRow(
      index + 1,
      entry.name,
      entry.score,
      entry.level
    )
    leaderboardBody.appendChild(row)
    if (entry.name === name) {
      userEntry = entry
    }
  }

  if (!userEntry) {
    const userIndex = leaderboard.findIndex((entry) => entry.name === name)
    if (userIndex >= 0) {
      userEntry = leaderboard[userIndex]
    }
  }

  if (userEntry) {
    const userIndex = leaderboard.indexOf(userEntry) + 1
    const row = createLeaderboardRow(
      userIndex,
      userEntry.name,
      userEntry.score,
      userEntry.level
    )
    leaderboardBody.appendChild(row)
  }
}

function createLeaderboardRow(rank, name, score, level) {
  const row = document.createElement('tr')
  row.innerHTML = `<td>${rank}</td><td>${name}</td><td>${score}</td><td>${level}</td>`
  return row
}

displayLeaderboard()

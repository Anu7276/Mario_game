const game = document.querySelector(".game");
const mario = document.querySelector(".mario");
const obstacle = document.querySelector(".obstacle");
const scoreText = document.querySelector(".score");
const gameOverScreen = document.querySelector(".game-over");
const restartButton = document.querySelector(".game-over button");

let score = 0;
let gameRunning = true;
let speedLevel = 1;
let animationFrameId = null;

// Mario Jump Physics (Smooth parabolic arc & natural landing)
let marioY = 0;
let velocityY = 0;
const gravity = 0.75;
const jumpForce = 15;
let isJumping = false;

// Obstacle position
let obstacleLeft = 0;

// Dynamic speed based on screen width so obstacle transit time is fast & consistent on all screens (Laptop & Mobile)
function getObstacleSpeed() {
    // Crosses screen in approx ~1.6 - 2.0 seconds regardless of screen width
    const baseSpeed = Math.max(5.5, game.clientWidth / 110);
    return baseSpeed * speedLevel;
}

// Jump function
function jump() {
    if (!gameRunning || isJumping) return;
    isJumping = true;
    velocityY = jumpForce;
}

// Keyboard controls
document.addEventListener("keydown", (event) => {
    if (event.code === "Space" || event.code === "ArrowUp") {
        event.preventDefault();
        jump();
    }
});

// Mobile touch / click anywhere on screen
game.addEventListener("pointerdown", (event) => {
    if (event.target === restartButton || (gameOverScreen.style.display === "flex" && gameOverScreen.contains(event.target))) {
        return;
    }
    jump();
});

// Reset obstacle to right edge
function resetObstacle() {
    obstacleLeft = game.clientWidth;
    obstacle.style.left = obstacleLeft + "px";
    obstacle.style.right = "auto";
}

// Main 60FPS Game Loop
function gameLoop() {
    if (!gameRunning) return;

    // 1. Smooth Mario Jump Physics
    if (isJumping) {
        marioY += velocityY;
        velocityY -= gravity;

        if (marioY <= 0) {
            marioY = 0;
            velocityY = 0;
            isJumping = false;
        }
    }
    mario.style.bottom = marioY + "px";

    // 2. Move obstacle at screen-scaled speed
    const currentSpeed = getObstacleSpeed();
    obstacleLeft -= currentSpeed;

    if (obstacleLeft < -obstacle.offsetWidth) {
        obstacleLeft = game.clientWidth;

        score++;
        scoreText.textContent = `Score : ${score}`;

        // Increase difficulty gradually
        if (score % 4 === 0) {
            speedLevel += 0.08;
        }
    }

    obstacle.style.left = obstacleLeft + "px";
    obstacle.style.right = "auto";

    // 3. Collision detection
    const marioRect = mario.getBoundingClientRect();
    const obstacleRect = obstacle.getBoundingClientRect();
    const pad = 6;

    if (
        marioRect.right - pad > obstacleRect.left &&
        marioRect.left + pad < obstacleRect.right &&
        marioRect.bottom - pad > obstacleRect.top &&
        marioRect.top + pad < obstacleRect.bottom
    ) {
        gameOver();
        return;
    }

    animationFrameId = requestAnimationFrame(gameLoop);
}

// Game Over
function gameOver() {
    gameRunning = false;
    gameOverScreen.style.display = "flex";
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
}

// Restart game
function restartGame() {
    score = 0;
    speedLevel = 1;
    gameRunning = true;
    isJumping = false;
    marioY = 0;
    velocityY = 0;

    scoreText.textContent = "Score : 0";
    mario.style.bottom = "0px";
    resetObstacle();
    gameOverScreen.style.display = "none";

    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    animationFrameId = requestAnimationFrame(gameLoop);
}

restartButton.addEventListener("click", (e) => {
    e.stopPropagation();
    restartGame();
});

// Start the game
resetObstacle();
animationFrameId = requestAnimationFrame(gameLoop);


   
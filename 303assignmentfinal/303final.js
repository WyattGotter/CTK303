const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Resize canvas to 85% of the window's width and height
canvas.width = window.innerWidth * 0.85;
canvas.height = window.innerHeight * 0.85;

// Game objects
let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 17,
    speedX: 16,
    speedY: 16,
    visible: true,
    reset() {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.speedX = -this.speedX;
        this.visible = true;
    }
};

let paddle1 = {
    x: 20, y: canvas.height / 2 - 120, width: 10, height: 240, speed: 40,
    score: 0, color: '#FFF', lastScored: false
};
let paddle2 = {
    x: canvas.width - 30, y: canvas.height / 2 - 120, width: 10, height: 240, speed: 40,
    score: 0, color: '#FFF', lastScored: false
};

let keys = { w: false, s: false };

let powerUp = {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    width: 50,
    height: 50,
    visible: true
};

let additionalBalls = [];

// Event listeners for keydown and keyup
document.addEventListener('keydown', function(event) {
    if (event.key === 'w' || event.key === 's') {
        keys[event.key] = true;
    }
});

document.addEventListener('keyup', function(event) {
    if (event.key === 'w' || event.key === 's') {
        keys[event.key] = false;
    }
});

const aiReactionThreshold = 0.1; // Smaller value = better reaction
const aiMaxSpeed = 30; // Lower value = slower AI

function movePaddles() {
    if (keys.w && paddle1.y > 0) {
        paddle1.y -= paddle1.speed;
    }
    if (keys.s && paddle1.y + paddle1.height < canvas.height) {
        paddle1.y += paddle1.speed;
    }

    let paddle2Center = paddle2.y + paddle2.height / 2;
    if (Math.random() < aiReactionThreshold) {
        if (ball.y > paddle2Center && paddle2.y + paddle2.height < canvas.height) {
            paddle2.y += Math.min(aiMaxSpeed, paddle2.speed);
        } else if (ball.y < paddle2Center && paddle2.y > 0) {
            paddle2.y -= Math.min(aiMaxSpeed, paddle2.speed);
        }
    }
}

function drawBall(ballObj) {
    ctx.beginPath();
    ctx.arc(ballObj.x, ballObj.y, ballObj.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.closePath();
}

function drawPowerUp() {
    if (!powerUp.visible) return;
    ctx.fillStyle = '#FFD700'; // Gold color
    ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
}

function drawPaddle(paddle) {
    ctx.fillStyle = paddle.color;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function updatePaddleColor(paddle) {
    if (paddle.lastScored) {
        paddle.color = '#39FF14';
    } else {
        paddle.color = '#FFF';
    }
}

function spawnAdditionalBall() {
    let newBall = {
        x: powerUp.x, y: powerUp.y,
        radius: ball.radius,
        speedX: -ball.speedX, speedY: -ball.speedY,
        visible: true
    };
    additionalBalls.push(newBall);
}

function moveBall(ballObj) {
    if (!ballObj.visible) return;

    ballObj.x += ballObj.speedX;
    ballObj.y += ballObj.speedY;

    // Collision with top and bottom
    if (ballObj.y + ballObj.radius > canvas.height || ballObj.y - ballObj.radius < 0) {
        ballObj.speedY = -ballObj.speedY;
    }

    // Collision with paddles
    if (ballObj.x - ballObj.radius < paddle1.x + paddle1.width && ballObj.y > paddle1.y && ballObj.y < paddle1.y + paddle1.height) {
        ballObj.speedX = -ballObj.speedX;
    }
    if (ballObj.x + ballObj.radius > paddle2.x && ballObj.y > paddle2.y && ballObj.y < paddle2.y + paddle2.height) {
        ballObj.speedX = -ballObj.speedX;
    }

    // Collision with power-up
    if (ballObj.x + ballObj.radius > powerUp.x && ballObj.x - ballObj.radius < powerUp.x + powerUp.width &&
        ballObj.y + ballObj.radius > powerUp.y && ballObj.y - ballObj.radius < powerUp.y + powerUp.height && 
        powerUp.visible) {
        powerUp.visible = false; // Hide the power-up
        spawnAdditionalBall();
    }

    // Check if the ball goes past the paddles
    if (ballObj.x + ballObj.radius < 0 || ballObj.x - ballObj.radius > canvas.width) {
        ballObj.visible = false;
        updateScore(ballObj);
    }
}

function drawScore() {
    ctx.font = '30px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(`Player 1: ${paddle1.score}`, 50, 30);
    ctx.fillText(`Player 2: ${paddle2.score}`, canvas.width - 200, 30);
}

function updateScore(ballObj) {
    if (ballObj.x + ballObj.radius < 0) {
        paddle2.score++;
    } else if (ballObj.x - ballObj.radius > canvas.width) {
        paddle1.score++;
    }

    // Check if all balls are no longer visible
    if (!ball.visible && additionalBalls.every(b => !b.visible)) {
        resetGame();
    }
}

function resetGame() {
    ball.reset();
    additionalBalls = [];
    powerUp.visible = true; // Respawn the power-up
    powerUp.x = Math.random() * canvas.width;
    powerUp.y = Math.random() * canvas.height;
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    moveBall(ball);
    additionalBalls.forEach(moveBall);

    drawBall(ball);
    additionalBalls.forEach(ball => drawBall(ball));

    drawPaddle(paddle1);
    drawPaddle(paddle2);

    updatePaddleColor(paddle1);
    updatePaddleColor(paddle2);

    movePaddles();

    drawScore();
    drawPowerUp();

    requestAnimationFrame(gameLoop);
}

gameLoop();
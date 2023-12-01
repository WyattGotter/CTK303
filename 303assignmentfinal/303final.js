const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');
const enableAudioButton = document.getElementById('enableAudioButton');
const backgroundMusic = new Audio('wyattspongmusic.mp3'); // Replace with your MP3 file path
const collisionSound = new Audio('wyattboopnoise.mp3'); // Replace with your sound file path
// Detect if the user is on a mobile device
const isMobileDevice = /Mobi|Android|iPhone/i.test(navigator.userAgent);


// Resize canvas to 85% of the window's width and height
canvas.width = window.innerWidth * .99;
canvas.height = window.innerHeight * .99;

// Game objects
let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 14,
    speedX: 14,
    speedY: 14,
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
    x: canvas.width - 60, y: canvas.height / 2 - 100, width: 10, height: 240, speed: 30,
    score: 0, color: '#FFF', lastScored: false
};

let keys = { w: false, s: false };

let powerUpTypes = ['multiball', 'breakout'];
let currentPowerUpTypeIndex = 0;
let lastScore = 0;

let powerUp = {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    width: 58,
    height: 58,
    visible: true,
    type: powerUpTypes[currentPowerUpTypeIndex],
    move() {
        this.x += Math.random() * 5 - 2.5; // Random horizontal movement
        this.y += Math.random() * 5 - 2.5; // Random vertical movement
        // Keep the power-up within the canvas
        this.x = Math.max(0, Math.min(this.x, canvas.width - this.width));
        this.y = Math.max(0, Math.min(this.y, canvas.height - this.height));
    }
};
let breakoutBlocks = [];
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

const aiReactionThreshold = 60; // Increased value for slower reaction
const aiMaxSpeed = 7; // Lower value for slower AI paddle speed

// Adjust game speed for mobile devices
if (isMobileDevice) {
    ball.speedX = 8; // Slower ball speed
    ball.speedY = 8;
    paddle1.speed = 20; // Slower paddle speed
    paddle2.speed = 20;
}

function movePaddles() {
    // For desktop: Use keyboard input
    if (!isMobileDevice) {
        if (keys.w && paddle1.y > 0) {
            paddle1.y -= paddle1.speed;
        }
        if (keys.s && paddle1.y + paddle1.height < canvas.height) {
            paddle1.y += paddle1.speed;
        }
    }
     // Determine which ball to track
     let ballToTrack = ball;
     if (!ball.visible && additionalBalls.length > 0) {
         // Find the first visible additional ball
         ballToTrack = additionalBalls.find(b => b.visible);
     }

     if (ballToTrack) {
        // AI paddle movement based on the ball to track
        let paddle2Center = paddle2.y + paddle2.height / 2;
        let deltaY = ballToTrack.y - paddle2Center;
        if (Math.abs(deltaY) > aiReactionThreshold) {
            if (deltaY > 0 && paddle2.y + paddle2.height < canvas.height) {
                paddle2.y += Math.min(Math.abs(deltaY), aiMaxSpeed);
            } else if (deltaY < 0 && paddle2.y > 0) {
                paddle2.y -= Math.min(Math.abs(deltaY), aiMaxSpeed);
            }
        }
    }
}

/// Function to move paddle 1 based on touch position and prevent scrolling
function touchMovePaddle(event) {
    event.preventDefault(); // Prevent default behavior (scrolling) when touching the canvas

    var touchY = event.touches[0].clientY - canvas.getBoundingClientRect().top;
    // Move the paddle to the touch position
    paddle1.y = touchY - paddle1.height / 2;

    // Prevent the paddle from going out of bounds
    paddle1.y = Math.max(paddle1.y, 0);
    paddle1.y = Math.min(paddle1.y, canvas.height - paddle1.height);
}

// Add touch event listeners
canvas.addEventListener('touchmove', touchMovePaddle, { passive: false }); // Ensure default behavior is prevented
// Load and play background music
backgroundMusic.loop = true;
backgroundMusic.play();

function drawBall(ballObj) {
    ctx.beginPath();
    ctx.arc(ballObj.x, ballObj.y, ballObj.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.closePath();
}

function drawPowerUp() {
    if (!powerUp.visible) return;
    ctx.fillStyle = powerUp.type === 'multiball' ? '#FFD700' : '#FF6347'; // Gold for multiball, Tomato for breakout
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
    // Create the first additional ball
    let newBall1 = {
        x: powerUp.x, y: powerUp.y,
        radius: ball.radius,
        speedX: -ball.speedX, speedY: -ball.speedY,
        visible: true
    };

    // Create the second additional ball with slightly different speeds
    let newBall2 = {
        x: powerUp.x, y: powerUp.y,
        radius: ball.radius,
        speedX: -ball.speedX * 1.1, speedY: -ball.speedY * 0.9, // Adjust speeds for variety
        visible: true
    };

    additionalBalls.push(newBall1, newBall2); // Add both balls to the additionalBalls array
}
function moveBall(ballObj) {
    if (!ballObj.visible) return;

    ballObj.x += ballObj.speedX;
    ballObj.y += ballObj.speedY;

    // Handle collisions with breakout blocks
    handleBallCollisionWithBreakoutBlocks(ballObj);

    // Collision with top and bottom
    if (ballObj.y + ballObj.radius > canvas.height || ballObj.y - ballObj.radius < 0) {
        ballObj.speedY = -ballObj.speedY;
    }

    // Collision with paddles
    if (ballObj.x - ballObj.radius < paddle1.x + paddle1.width && ballObj.y > paddle1.y && ballObj.y < paddle1.y + paddle1.height) {
        ballObj.speedX = -ballObj.speedX;
        collisionSound.play(); // Play collision sound only for paddle collision
    }
    if (ballObj.x + ballObj.radius > paddle2.x && ballObj.y > paddle2.y && ballObj.y < paddle2.y + paddle2.height) {
        ballObj.speedX = -ballObj.speedX;
        collisionSound.play(); // Play collision sound only for paddle collision
    }

    // Collision with power-up
    if (ballObj.x + ballObj.radius > powerUp.x && ballObj.x - ballObj.radius < powerUp.x + powerUp.width &&
        ballObj.y + ballObj.radius > powerUp.y && ballObj.y - ballObj.radius < powerUp.y + powerUp.height && 
        powerUp.visible) {
        powerUp.visible = false; // Hide the power-up
        if (powerUp.type === 'multiball') {
            spawnAdditionalBall();
        } else if (powerUp.type === 'breakout') {
            spawnBreakoutBlocks();
        }
        
    }

    // Check if the ball goes past the paddles (Moved outside the power-up collision if-statement)
    if (ballObj.x + ballObj.radius < 0 || ballObj.x - ballObj.radius > canvas.width) {
        ballObj.visible = false;
        updateScore(ballObj);
    }
}

function drawScore() {
    ctx.font = '30px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(`You: ${paddle1.score}`, 50, 30);
    ctx.fillText(`Frank: ${paddle2.score}`, canvas.width - 200, 30);
}

function updateScore(ballObj) {
    if (ballObj.x + ballObj.radius < 0) {
        paddle2.score++;
    } else if (ballObj.x - ballObj.radius > canvas.width) {
        paddle1.score++;
    }

    if (paddle1.score + paddle2.score > lastScore + 2) {
        lastScore = paddle1.score + paddle2.score;
        currentPowerUpTypeIndex = (currentPowerUpTypeIndex + 1) % powerUpTypes.length;
        powerUp.type = powerUpTypes[currentPowerUpTypeIndex];
        powerUp.visible = true; // Respawn the power-up
        powerUp.x = Math.random() * canvas.width;
        powerUp.y = Math.random() * canvas.height;
    }

    // Check if all balls are no longer visible
    if (!ball.visible && additionalBalls.every(b => !b.visible)) {
        resetGame();
    }
}
function spawnBreakoutBlocks(opponentPaddle) {
    // Calculate the size and number of blocks to cover a larger surface area
    const blockWidth = canvas.width * 0.05; // Blocks are 5% of the canvas width
    const blockHeight = canvas.height * 0.05; // Blocks are 5% of the canvas height
    const rows = Math.floor(canvas.height * 0.6 / blockHeight); // Covers 60% of the canvas height
    const cols = 1; // Single column of large blocks
    const offsetX = opponentPaddle === paddle1 ? paddle1.x + paddle1.width : paddle2.x - blockWidth; // Place in front of the opponent paddle
    
    breakoutBlocks = []; // Clear existing blocks
    for (let r = 0; r < rows; r++) {
        breakoutBlocks.push({
            x: offsetX,
            y: (canvas.height - rows * blockHeight) / 2 + r * blockHeight, // Center vertically
            width: blockWidth,
            height: blockHeight,
            visible: true
        });
    }
}

function drawBreakoutBlocks() {
    breakoutBlocks.forEach(block => {
        if (block.visible) {
            ctx.fillStyle = '#FF6347'; // Tomato color for the breakout blocks
            ctx.fillRect(block.x, block.y, block.width, block.height);
        }
    });
}

function handleBallCollisionWithBreakoutBlocks(ballObj) {
    breakoutBlocks.forEach(block => {
        if (block.visible && ballObj.x + ballObj.radius > block.x && ballObj.x - ballObj.radius < block.x + block.width &&
            ballObj.y + ballObj.radius > block.y && ballObj.y - ballObj.radius < block.y + block.height) {
            ballObj.speedX = -ballObj.speedX; // Reflect the ball's X direction
            block.visible = false; // Hide the block
            collisionSound.play(); // Play collision sound
        }
    });
}

function resetGame() {
    ball.reset();
    additionalBalls = [];
    powerUp.visible = true; // Respawn the power-up
    powerUp.x = Math.random() * canvas.width;
    powerUp.y = Math.random() * canvas.height;
}

// Event listener for the enable audio button
enableAudioButton.addEventListener('click', function() {
    backgroundMusic.loop = true;
    backgroundMusic.play();
    enableAudioButton.style.display = 'none'; // Hide the button
});

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Move and draw power-up
    powerUp.move();
    drawPowerUp();

    // Move all balls
    moveBall(ball);
    additionalBalls.forEach(moveBall);

    // Draw all balls
    drawBall(ball);
    additionalBalls.forEach(drawBall);

    // Draw paddles and update their colors
    drawPaddle(paddle1);
    drawPaddle(paddle2);
    updatePaddleColor(paddle1);
    updatePaddleColor(paddle2);

    // Move paddles based on key presses
    movePaddles();

    // Draw the breakout blocks
    drawBreakoutBlocks();
    
    handleBallCollisionWithBreakoutBlocks(ball); // Handle collisions for the main ball
    additionalBalls.forEach(handleBallCollisionWithBreakoutBlocks); // Handle collisions for additional balls
    // Draw the score
    drawScore();

    // Request the next animation frame
    requestAnimationFrame(gameLoop);
}


gameLoop();
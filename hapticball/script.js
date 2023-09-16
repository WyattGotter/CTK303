const ball = document.getElementById('ball');
const container = document.querySelector('.container');
let ballX = container.clientWidth / 2 - ball.clientWidth / 2;
let ballY = container.clientHeight / 2 - ball.clientHeight / 2;
let ballSpeedX = 0;
let ballSpeedY = 0;

const bounceFactor = 0.8; // Adjust the bounce factor (higher values make it bouncier)
const responsiveness = 0.1; // Adjust the responsiveness (higher values make it more reactive)

window.addEventListener('devicemotion', handleDeviceMotion);

function handleDeviceMotion(event) {
    const { x, y } = event.accelerationIncludingGravity;
    const invertedX = -x;

    ballSpeedX += invertedX * responsiveness;
    ballSpeedY += y * responsiveness;
  
    ballSpeedX *= 0.95; 
    ballSpeedY *= 0.95; 
  
    const gravity = 0.2; 
    ballSpeedY += gravity;

    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // Bounce off the container boundaries
    if (ballX < 0 || ballX > container.clientWidth - ball.clientWidth) {
        ballSpeedX *= -bounceFactor; // Reverse velocity and reduce speed on left/right boundary
        ballX = Math.max(0, Math.min(container.clientWidth - ball.clientWidth, ballX)); // Ensure ball stays inside
    }
    if (ballY < 0 || ballY > container.clientHeight - ball.clientHeight) {
        ballSpeedY *= -bounceFactor; // Reverse velocity and reduce speed on top/bottom boundary
        ballY = Math.max(0, Math.min(container.clientHeight - ball.clientHeight, ballY)); // Ensure ball stays inside
    }

    ball.style.transform = `translate(${ballX}px, ${ballY}px)`;
}

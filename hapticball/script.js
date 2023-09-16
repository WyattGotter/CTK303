const ball = document.getElementById('ball');
const container = document.querySelector('.container');
let shouldRumble = false;

let ballX = container.clientWidth / 2 - ball.clientWidth / 2;
let ballY = container.clientHeight / 2 - ball.clientHeight / 2;
let ballSpeedX = 0;
let ballSpeedY = 0;

window.addEventListener('devicemotion', handleDeviceMotion);

function handleDeviceMotion(event) {
    const { x, y } = event.accelerationIncludingGravity;

    const invertedX = -x;

    const collidedWithBorder = ballX <= 0 || ballX >= container.clientWidth - ball.clientWidth || ballY <= 0 || ballY >= container.clientHeight - ball.clientHeight;

    ballSpeedX += invertedX / 3;
    ballSpeedY += y / 3;

  
    ballSpeedX *= 0.95; 
    ballSpeedY *= 0.95; 

  
    const gravity = 0.2; 
    ballSpeedY += gravity;

    ballX += ballSpeedX;
    ballY += ballSpeedY;

    if (ballX < 0 || ballX > container.clientWidth - ball.clientWidth || ballY < 0 || ballY > container.clientHeight - ball.clientHeight) {
        if (!shouldRumble) {
            vibrateDevice();
            shouldRumble = true;
        }
        ballSpeedX *= -0.8;
        ballSpeedY *= -0.8;
    } else {
        shouldRumble = false;
    }

    ball.style.transform = `translate(${ballX}px, ${ballY}px)`;
}

function vibrateDevice() {
    if ("vibrate" in navigator) {
        navigator.vibrate(200);
    } else if ("hapticFeedback" in window) {
        window.hapticFeedback();
    } else {
        alert("Haptic feedback is not supported on this device.");
    }
}

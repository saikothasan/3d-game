// Game elements
const gameContainer = document.getElementById('game-container');
const playerElement = document.getElementById('player');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('high-score');
const gameOverMessage = document.getElementById('game-over-message');
const ground = document.getElementById('ground');
const powerUpIndicator = document.getElementById('power-up-indicator');
const particlesContainer = document.getElementById('particles-container');

// Create pause screen element
const pauseScreen = document.createElement('div');
pauseScreen.id = 'pause-screen';
pauseScreen.textContent = 'PAUSED';
gameContainer.appendChild(pauseScreen);

// Create mobile controls if on mobile
if (window.innerWidth <= 800) {
    const mobileControls = document.createElement('div');
    mobileControls.id = 'mobile-controls';
    
    const jumpButton = document.createElement('div');
    jumpButton.className = 'mobile-button';
    jumpButton.textContent = '↑';
    jumpButton.addEventListener('touchstart', jump);
    
    const duckButton = document.createElement('div');
    duckButton.className = 'mobile-button';
    duckButton.textContent = '↓';
    duckButton.addEventListener('touchstart', startDuck);
    duckButton.addEventListener('touchend', endDuck);
    
    mobileControls.appendChild(jumpButton);
    mobileControls.appendChild(duckButton);
    document.body.appendChild(mobileControls);
}

// Audio setup
const sounds = {
    jump: new Audio(),
    land: new Audio(),
    duck: new Audio(),
    collision: new Audio(),
    point: new Audio(),
    powerUp: new Audio()
};

// We'll use placeholder URLs - in a real project, you'd have actual sound files
sounds.jump.src = 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU...';
sounds.land.src = 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU...';
sounds.duck.src = 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU...';
sounds.collision.src = 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU...';
sounds.point.src = 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU...';
sounds.powerUp.src = 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU...';

// Set volume for all sounds
Object.values(sounds).forEach(sound => {
    sound.volume = 0.3;
});

let isMuted = false;

function toggleMute() {
    isMuted = !isMuted;
    Object.values(sounds).forEach(sound => {
        sound.muted = isMuted;
    });
}

function playSound(soundName) {
    if (!isMuted) {
        // Clone the sound to allow overlapping playback
        const soundClone = sounds[soundName].cloneNode();
        soundClone.play();
    }
}

// Game state
let score = 0;
let highScore = 0;
let isGameOver = false;
let isPaused = false;
let playerY = 0;
let playerVelocityY = 0;
let isJumping = false;
let isDucking = false;
const gravity = 1.5;
const jumpStrength = 23;
let gameSpeed = 5;
const maxGameSpeed = 18;
const gameSpeedAcceleration = 0.001;

let obstacleSpawnTimer = 0;
const initialObstacleSpawnInterval = 120;
let obstacleSpawnInterval = initialObstacleSpawnInterval;

const obstacles = [];
const powerUps = [];
const particles = [];

// Player dimensions
let playerWidth = playerElement.offsetWidth;
let playerHeight = playerElement.offsetHeight;
const gameContainerWidth = gameContainer.offsetWidth;
const gameContainerHeight = gameContainer.offsetHeight;

// Player initial visual position
playerElement.style.bottom = `0px`;
playerElement.style.left = `50px`;

// Power-up state
let activePowerUp = null;
let powerUpTimer = 0;
const powerUpDuration = 500; // frames (about 8 seconds at 60fps)

// Day/night cycle
let isDayTime = true;
let dayNightTimer = 0;
const dayNightCycleDuration = 1800; // frames (about 30 seconds at 60fps)

function toggleDayNight() {
    isDayTime = !isDayTime;
    if (isDayTime) {
        gameContainer.classList.remove('night-mode');
    } else {
        gameContainer.classList.add('night-mode');
    }
}

function updateDayNightCycle() {
    dayNightTimer++;
    if (dayNightTimer >= dayNightCycleDuration) {
        toggleDayNight();
        dayNightTimer = 0;
    }
}

function loadHighScore() {
    const savedHighScore = localStorage.getItem('dinoGameHighScore');
    if (savedHighScore) {
        highScore = parseInt(savedHighScore, 10);
    }
    highScoreDisplay.textContent = highScore;
}

function saveHighScore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('dinoGameHighScore', highScore.toString());
        highScoreDisplay.textContent = highScore;
    }
}

function updateScore() {
    score++;
    scoreDisplay.textContent = score;
    
    // Play sound every 100 points
    if (score % 100 === 0) {
        playSound('point');
    }

    // Increase game speed gradually
    if (gameSpeed < maxGameSpeed) {
        gameSpeed += gameSpeedAcceleration;
    }
    
    // Shorten obstacle spawn interval as game speeds up
    obstacleSpawnInterval = Math.max(35, initialObstacleSpawnInterval - (gameSpeed * 5));
    
    const baseAnimationDuration = 0.8; 
    const newDuration = Math.max(0.1, baseAnimationDuration - gameSpeed * 0.03);
    ground.style.animationDuration = `${newDuration}s`;
}

function jump() {
    if (!isJumping && !isGameOver && !isPaused) {
        isJumping = true;
        playerVelocityY = jumpStrength;
        playerElement.classList.add('jumping');
        playerElement.classList.remove('running');
        
        // End ducking if player was ducking
        if (isDucking) {
            endDuck();
        }
        
        playSound('jump');
        createParticles(5, parseInt(playerElement.style.left) + playerWidth/2, gameContainerHeight - 40, '#8B4513');
    }
}

function startDuck() {
    if (!isJumping && !isGameOver && !isPaused) {
        isDucking = true;
        playerElement.classList.add('ducking');
        playerElement.classList.remove('running');
        
        // Update player dimensions for collision detection
        playerHeight = playerElement.offsetHeight;
        
        playSound('duck');
    }
}

function endDuck() {
    if (isDucking && !isGameOver && !isPaused) {
        isDucking = false;
        playerElement.classList.remove('ducking');
        if (!isJumping) {
            playerElement.classList.add('running');
        }
        
        // Update player dimensions for collision detection
        playerHeight = playerElement.offsetHeight;
    }
}

function updatePlayer() {
    if (isJumping) {
        playerY += playerVelocityY;
        playerVelocityY -= gravity;

        if (playerY <= 0) {
            playerY = 0;
            playerVelocityY = 0;
            isJumping = false;
            playerElement.classList.remove('jumping');
            if (!isGameOver && !isDucking) {
                playerElement.classList.add('running');
            }
            
            // Create dust particles when landing
            createParticles(8, parseInt(playerElement.style.left) + playerWidth/2, gameContainerHeight - 40, '#8B4513');
            playSound('land');
        }
    }
    
    playerElement.style.transform = `translateY(${-playerY}px)`;

    // Running animation
    if (!isJumping && !isDucking && !isGameOver) {
        if (!playerElement.classList.contains('running')) {
            playerElement.classList.add('running');
        }
    }
}

function createObstacle() {
    const obstacleElement = document.createElement('div');
    let obsData = {};
    
    // Determine obstacle type
    const obstacleType = Math.random();
    
    if (obstacleType < 0.25 && score > 150) { // Pterodactyls (flying obstacles)
        obstacleElement.classList.add('pterodactyl');
        const obsWidth = 50;
        const obsHeight = 35;
        
        // Different heights - some require jumping, some require ducking
        const heightOptions = [
            playerHeight * 0.5,  // Low - requires ducking
            playerHeight * 1.2,  // Medium - can jump or duck
            playerHeight * 1.8   // High - requires jumping
        ];
        
        const obsBottom = heightOptions[Math.floor(Math.random() * heightOptions.length)];

        obstacleElement.style.width = `${obsWidth}px`;
        obstacleElement.style.height = `${obsHeight}px`;
        obstacleElement.style.left = `${gameContainerWidth}px`;
        obstacleElement.style.bottom = `${obsBottom}px`;

        obsData = {
            element: obstacleElement,
            x: gameContainerWidth,
            y: obsBottom,
            width: obsWidth,
            height: obsHeight,
            type: 'pterodactyl'
        };
    } else { // Ground obstacles (cacti)
        obstacleElement.classList.add('obstacle');
        const type = Math.random();
        let obsWidth, obsHeight;

        if (type < 0.4) { // Short
            obsWidth = 30 + Math.random() * 20;
            obsHeight = 30 + Math.random() * 10;
        } else if (type < 0.7) { // Tall
            obsWidth = 20 + Math.random() * 10;
            obsHeight = 45 + Math.random() * 25;
        } else { // Multiple small
            obsWidth = (15 + Math.random() * 5) * (Math.floor(Math.random()*2)+1);
            obsHeight = 25 + Math.random() * 10;
        }

        obstacleElement.style.width = `${obsWidth}px`;
        obstacleElement.style.height = `${obsHeight}px`;
        obstacleElement.style.left = `${gameContainerWidth}px`;
        obstacleElement.style.bottom = `0px`;

        obsData = {
            element: obstacleElement,
            x: gameContainerWidth,
            y: 0,
            width: obsWidth,
            height: obsHeight,
            type: 'ground'
        };
    }

    obstacles.push(obsData);
    gameContainer.appendChild(obstacleElement);
}

function createPowerUp() {
    // Only create power-ups after a certain score and with low probability
    if (score < 300 || Math.random() > 0.05) return;
    
    const powerUpElement = document.createElement('div');
    powerUpElement.classList.add('power-up');
    
    // Choose power-up type
    const powerUpType = Math.random() < 0.5 ? 'shield' : 'slow-motion';
    powerUpElement.classList.add(powerUpType);
    
    // Position power-up
    const powerUpWidth = 30;
    const powerUpHeight = 30;
    const powerUpBottom = 50 + Math.random() * 100; // Random height
    
    powerUpElement.style.width = `${powerUpWidth}px`;
    powerUpElement.style.height = `${powerUpHeight}px`;
    powerUpElement.style.left = `${gameContainerWidth}px`;
    powerUpElement.style.bottom = `${powerUpBottom}px`;
    
    const powerUpData = {
        element: powerUpElement,
        x: gameContainerWidth,
        y: powerUpBottom,
        width: powerUpWidth,
        height: powerUpHeight,
        type: powerUpType
    };
    
    powerUps.push(powerUpData);
    gameContainer.appendChild(powerUpElement);
}

function activatePowerUp(type) {
    activePowerUp = type;
    powerUpTimer = powerUpDuration;
    
    if (type === 'shield') {
        playerElement.classList.add('shield');
        powerUpIndicator.textContent = 'Shield Active';
        powerUpIndicator.style.backgroundColor = 'rgba(0, 191, 255, 0.5)';
    } else if (type === 'slow-motion') {
        gameContainer.classList.add('slow-motion');
        gameSpeed *= 0.5; // Slow down game
        powerUpIndicator.textContent = 'Slow Motion';
        powerUpIndicator.style.backgroundColor = 'rgba(153, 50, 204, 0.5)';
    }
    
    powerUpIndicator.style.display = 'block';
    playSound('powerUp');
}

function deactivatePowerUp() {
    if (activePowerUp === 'shield') {
        playerElement.classList.remove('shield');
    } else if (activePowerUp === 'slow-motion') {
        gameContainer.classList.remove('slow-motion');
        gameSpeed *= 2; // Return to normal speed
    }
    
    activePowerUp = null;
    powerUpIndicator.style.display = 'none';
}

function updatePowerUps() {
    // Move existing power-ups
    for (let i = powerUps.length - 1; i >= 0; i--) {
        const powerUp = powerUps[i];
        powerUp.x -= gameSpeed;
        powerUp.element.style.left = `${powerUp.x}px`;
        
        // Remove off-screen power-ups
        if (powerUp.x + powerUp.width < 0) {
            powerUp.element.remove();
            powerUps.splice(i, 1);
        }
    }
    
    // Check for power-up collection
    if (!isGameOver) {
        const playerRect = getPlayerHitbox();
        
        for (let i = powerUps.length - 1; i >= 0; i--) {
            const powerUp = powerUps[i];
            const powerUpRect = {
                x: powerUp.x,
                y: powerUp.y,
                width: powerUp.width,
                height: powerUp.height
            };
            
            if (checkRectCollision(playerRect, powerUpRect)) {
                activatePowerUp(powerUp.type);
                powerUp.element.remove();
                powerUps.splice(i, 1);
            }
        }
    }
    
    // Update active power-up timer
    if (activePowerUp) {
        powerUpTimer--;
        if (powerUpTimer <= 0) {
            deactivatePowerUp();
        }
    }
}

function createParticles(count, x, y, color) {
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.style.backgroundColor = color;
        particle.style.left = `${x}px`;
        particle.style.bottom = `${y}px`;
        
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 3;
        const size = 2 + Math.random() * 4;
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        const particleData = {
            element: particle,
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            gravity: 0.1,
            life: 30 + Math.random() * 20
        };
        
        particles.push(particleData);
        particlesContainer.appendChild(particle);
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy -= particle.gravity;
        
        // Update visual position
        particle.element.style.left = `${particle.x}px`;
        particle.element.style.bottom = `${particle.y}px`;
        
        // Decrease life
        particle.life--;
        
        // Remove dead particles
        if (particle.life <= 0) {
            particle.element.remove();
            particles.splice(i, 1);
        }
    }
}

function updateObstacles() {
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        obs.x -= gameSpeed;
        obs.element.style.left = `${obs.x}px`;

        if (obs.x + obs.width < 0) {
            obs.element.remove();
            obstacles.splice(i, 1);
        }
    }

    obstacleSpawnTimer++;
    if (obstacleSpawnTimer >= obstacleSpawnInterval) {
        createObstacle();
        obstacleSpawnTimer = 0;
        
        // Chance to spawn a power-up
        if (Math.random() < 0.2) {
            createPowerUp();
        }
    }
}

function getPlayerHitbox() {
    // Create a more accurate hitbox based on player state
    let hitboxWidth = playerWidth * 0.8;
    let hitboxHeight = playerHeight * 0.9;
    let hitboxOffsetX = playerWidth * 0.1;
    let hitboxOffsetY = 0;
    
    if (isDucking) {
        hitboxHeight = playerHeight * 0.7; // Even smaller hitbox when ducking
        hitboxOffsetY = playerHeight * 0.1; // Adjust for the lower profile
    }
    
    return {
        x: parseInt(playerElement.style.left) + hitboxOffsetX,
        y: playerY + hitboxOffsetY,
        width: hitboxWidth,
        height: hitboxHeight
    };
}

function checkRectCollision(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

function checkCollision() {
    // Skip collision check if shield power-up is active
    if (activePowerUp === 'shield') return false;
    
    const playerRect = getPlayerHitbox();

    for (const obs of obstacles) {
        const obsRect = {
            x: obs.x + obs.width * 0.1, // Smaller hitbox
            y: obs.y,
            width: obs.width * 0.8,
            height: obs.height * 0.8
        };

        if (checkRectCollision(playerRect, obsRect)) {
            return true; // Collision
        }
    }
    return false; // No collision
}

function gameOver() {
    isGameOver = true;
    saveHighScore();
    gameOverMessage.style.display = 'block';
    ground.style.animationPlayState = 'paused';
    playerElement.classList.remove('running');
    playerElement.classList.remove('jumping');
    playerElement.classList.remove('ducking');
    
    // Deactivate any power-ups
    if (activePowerUp) {
        deactivatePowerUp();
    }
    
    // Create explosion particles
    createParticles(20, 
        parseInt(playerElement.style.left) + playerWidth/2, 
        gameContainerHeight - playerHeight/2, 
        '#FF6347');
    
    playSound('collision');
}

function togglePause() {
    if (isGameOver) return;
    
    isPaused = !isPaused;
    
    if (isPaused) {
        pauseScreen.style.display = 'flex';
        ground.style.animationPlayState = 'paused';
    } else {
        pauseScreen.style.display = 'none';
        ground.style.animationPlayState = 'running';
        requestAnimationFrame(gameLoop);
    }
}

function gameLoop() {
    if (isGameOver || isPaused) {
        return;
    }

    updatePlayer();
    updateObstacles();
    updatePowerUps();
    updateParticles();
    updateDayNightCycle();

    if (checkCollision()) {
        gameOver();
        return;
    }

    updateScore();
    requestAnimationFrame(gameLoop);
}

function resetGame() {
    score = 0;
    isGameOver = false;
    isPaused = false;
    playerY = 0;
    playerVelocityY = 0;
    isJumping = false;
    isDucking = false;
    gameSpeed = 5;
    obstacleSpawnTimer = 0;
    obstacleSpawnInterval = initialObstacleSpawnInterval;

    // Clear obstacles
    obstacles.forEach(obs => obs.element.remove());
    obstacles.length = 0;
    
    // Clear power-ups
    powerUps.forEach(powerUp => powerUp.element.remove());
    powerUps.length = 0;
    
    // Clear particles
    particles.forEach(particle => particle.element.remove());
    particles.length = 0;
    
    // Reset power-up state
    if (activePowerUp) {
        deactivatePowerUp();
    }
    
    // Reset UI
    scoreDisplay.textContent = score;
    loadHighScore();
    gameOverMessage.style.display = 'none';
    pauseScreen.style.display = 'none';
    
    // Reset player
    playerElement.style.transform = `translateY(0px)`;
    playerElement.classList.remove('jumping');
    playerElement.classList.remove('ducking');
    playerElement.classList.add('running');
    
    // Reset animation
    ground.style.animationPlayState = 'running';
    const currentInitialGroundAnimationDuration = 0.8 - gameSpeed * 0.03;
    ground.style.animationDuration = `${currentInitialGroundAnimationDuration}s`;

    gameLoop();
}

// Event Listeners
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        if (isGameOver) {
            resetGame();
        } else {
            jump();
        }
    } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        startDuck();
    } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        togglePause();
    } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleMute();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        endDuck();
    }
});

gameContainer.addEventListener('pointerdown', (e) => {
    if (isGameOver) {
        resetGame();
    } else {
        // Determine if click is in bottom half (duck) or top half (jump)
        const clickY = e.clientY - gameContainer.getBoundingClientRect().top;
        if (clickY > gameContainerHeight / 2) {
            startDuck();
        } else {
            jump();
        }
    }
});

gameContainer.addEventListener('pointerup', () => {
    if (isDucking) {
        endDuck();
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    playerWidth = playerElement.offsetWidth;
    playerHeight = playerElement.offsetHeight;
});

// Initial setup
loadHighScore();
playerElement.classList.add('running');
gameLoop();

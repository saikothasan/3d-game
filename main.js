// Game State Management
class GameState {
  constructor() {
    this.currentScreen = "main-menu"
    this.selectedCharacter = "dino"
    this.selectedDifficulty = "easy"
    this.settings = {
      volume: 30,
      graphicsQuality: "medium",
      showFPS: false,
    }
    this.achievements = new AchievementSystem()
    this.stats = {
      totalGamesPlayed: 0,
      totalScore: 0,
      totalJumps: 0,
      totalDucks: 0,
      totalObstaclesAvoided: 0,
      longestCombo: 0,
      totalPlayTime: 0,
    }
    this.loadData()
  }

  saveData() {
    localStorage.setItem(
      "dinoGameData",
      JSON.stringify({
        settings: this.settings,
        achievements: this.achievements.achievements,
        stats: this.stats,
      }),
    )
  }

  loadData() {
    const saved = localStorage.getItem("dinoGameData")
    if (saved) {
      const data = JSON.parse(saved)
      this.settings = { ...this.settings, ...data.settings }
      this.stats = { ...this.stats, ...data.stats }
      if (data.achievements) {
        this.achievements.achievements = data.achievements
      }
    }
  }
}

// Achievement System
class AchievementSystem {
  constructor() {
    this.achievements = {
      firstJump: { unlocked: false, title: "First Leap", description: "Make your first jump", progress: 0, target: 1 },
      score100: { unlocked: false, title: "Century", description: "Score 100 points", progress: 0, target: 100 },
      score500: { unlocked: false, title: "High Flyer", description: "Score 500 points", progress: 0, target: 500 },
      score1000: { unlocked: false, title: "Millennium", description: "Score 1000 points", progress: 0, target: 1000 },
      score5000: { unlocked: false, title: "Legend", description: "Score 5000 points", progress: 0, target: 5000 },
      jumper: { unlocked: false, title: "Jumping Jack", description: "Jump 100 times", progress: 0, target: 100 },
      ducker: { unlocked: false, title: "Limbo Master", description: "Duck 50 times", progress: 0, target: 50 },
      survivor: { unlocked: false, title: "Survivor", description: "Avoid 100 obstacles", progress: 0, target: 100 },
      combo10: { unlocked: false, title: "Combo King", description: "Achieve a 10x combo", progress: 0, target: 10 },
      combo25: { unlocked: false, title: "Combo Master", description: "Achieve a 25x combo", progress: 0, target: 25 },
      speedDemon: {
        unlocked: false,
        title: "Speed Demon",
        description: "Reach maximum game speed",
        progress: 0,
        target: 1,
      },
      nightRunner: {
        unlocked: false,
        title: "Night Runner",
        description: "Play during night mode",
        progress: 0,
        target: 1,
      },
      powerUser: { unlocked: false, title: "Power User", description: "Collect 10 power-ups", progress: 0, target: 10 },
      perfectPattern: {
        unlocked: false,
        title: "Pattern Perfect",
        description: "Complete a perfect obstacle pattern",
        progress: 0,
        target: 1,
      },
      marathoner: {
        unlocked: false,
        title: "Marathoner",
        description: "Play for 10 minutes total",
        progress: 0,
        target: 600,
      },
      hardcoreGamer: {
        unlocked: false,
        title: "Hardcore Gamer",
        description: "Complete a game on Hard difficulty",
        progress: 0,
        target: 1,
      },
      insanePlayer: {
        unlocked: false,
        title: "Insane Player",
        description: "Score 1000 on Insane difficulty",
        progress: 0,
        target: 1000,
      },
    }
  }

  checkAchievement(type, value, gameStats) {
    const newUnlocks = []

    switch (type) {
      case "jump":
        this.updateProgress("firstJump", 1)
        this.updateProgress("jumper", gameStats.totalJumps)
        break
      case "duck":
        this.updateProgress("ducker", gameStats.totalDucks)
        break
      case "score":
        this.updateProgress("score100", value)
        this.updateProgress("score500", value)
        this.updateProgress("score1000", value)
        this.updateProgress("score5000", value)
        break
      case "obstacle":
        this.updateProgress("survivor", gameStats.totalObstaclesAvoided)
        break
      case "combo":
        this.updateProgress("combo10", value)
        this.updateProgress("combo25", value)
        break
      case "maxSpeed":
        this.updateProgress("speedDemon", 1)
        break
      case "nightMode":
        this.updateProgress("nightRunner", 1)
        break
      case "powerUp":
        this.updateProgress("powerUser", value)
        break
      case "perfectPattern":
        this.updateProgress("perfectPattern", 1)
        break
      case "playTime":
        this.updateProgress("marathoner", gameStats.totalPlayTime)
        break
      case "hardDifficulty":
        this.updateProgress("hardcoreGamer", 1)
        break
      case "insaneDifficulty":
        this.updateProgress("insanePlayer", value)
        break
    }

    // Check for new unlocks
    for (const [key, achievement] of Object.entries(this.achievements)) {
      if (!achievement.unlocked && achievement.progress >= achievement.target) {
        achievement.unlocked = true
        newUnlocks.push(achievement)
      }
    }

    return newUnlocks
  }

  updateProgress(achievementKey, value) {
    if (this.achievements[achievementKey] && !this.achievements[achievementKey].unlocked) {
      this.achievements[achievementKey].progress = Math.max(this.achievements[achievementKey].progress, value)
    }
  }

  getUnlockedCount() {
    return Object.values(this.achievements).filter((a) => a.unlocked).length
  }

  getTotalCount() {
    return Object.keys(this.achievements).length
  }
}

// Obstacle Pattern System
class ObstaclePatternSystem {
  constructor() {
    this.patterns = [
      {
        name: "Jump Sequence",
        obstacles: [
          { type: "ground", width: 30, height: 40, delay: 0 },
          { type: "ground", width: 25, height: 45, delay: 80 },
          { type: "ground", width: 35, height: 35, delay: 160 },
        ],
        warning: "Triple Jump!",
      },
      {
        name: "Duck Sequence",
        obstacles: [
          { type: "pterodactyl", width: 50, height: 35, y: 40, delay: 0 },
          { type: "pterodactyl", width: 50, height: 35, y: 45, delay: 100 },
          { type: "pterodactyl", width: 50, height: 35, y: 35, delay: 200 },
        ],
        warning: "Duck Storm!",
      },
      {
        name: "Mixed Challenge",
        obstacles: [
          { type: "ground", width: 30, height: 50, delay: 0 },
          { type: "pterodactyl", width: 50, height: 35, y: 60, delay: 120 },
          { type: "ground", width: 25, height: 40, delay: 240 },
        ],
        warning: "Mixed Challenge!",
      },
      {
        name: "Speed Test",
        obstacles: [
          { type: "ground", width: 20, height: 30, delay: 0 },
          { type: "ground", width: 20, height: 35, delay: 60 },
          { type: "ground", width: 20, height: 40, delay: 120 },
          { type: "ground", width: 20, height: 30, delay: 180 },
        ],
        warning: "Speed Test!",
      },
    ]
    this.currentPattern = null
    this.patternProgress = 0
    this.patternTimer = 0
  }

  shouldTriggerPattern(score, gameSpeed) {
    // Trigger patterns based on score and difficulty
    return score > 200 && Math.random() < 0.15 && !this.currentPattern
  }

  startPattern() {
    this.currentPattern = this.patterns[Math.floor(Math.random() * this.patterns.length)]
    this.patternProgress = 0
    this.patternTimer = 0
    return this.currentPattern
  }

  getNextObstacle() {
    if (!this.currentPattern || this.patternProgress >= this.currentPattern.obstacles.length) {
      return null
    }

    const obstacle = this.currentPattern.obstacles[this.patternProgress]
    if (this.patternTimer >= obstacle.delay) {
      this.patternProgress++
      return obstacle
    }
    return null
  }

  update() {
    if (this.currentPattern) {
      this.patternTimer++
      if (this.patternProgress >= this.currentPattern.obstacles.length) {
        this.currentPattern = null
        this.patternTimer = 0
        return true // Pattern completed
      }
    }
    return false
  }
}

// Difficulty System
class DifficultySystem {
  constructor() {
    this.difficulties = {
      easy: {
        name: "Easy",
        gameSpeedMultiplier: 0.8,
        obstacleSpawnRate: 1.2,
        powerUpChance: 0.15,
        scoreMultiplier: 1.0,
      },
      medium: {
        name: "Medium",
        gameSpeedMultiplier: 1.0,
        obstacleSpawnRate: 1.0,
        powerUpChance: 0.1,
        scoreMultiplier: 1.2,
      },
      hard: {
        name: "Hard",
        gameSpeedMultiplier: 1.3,
        obstacleSpawnRate: 0.8,
        powerUpChance: 0.05,
        scoreMultiplier: 1.5,
      },
      insane: {
        name: "Insane",
        gameSpeedMultiplier: 1.6,
        obstacleSpawnRate: 0.6,
        powerUpChance: 0.02,
        scoreMultiplier: 2.0,
      },
    }
  }

  getDifficulty(level) {
    return this.difficulties[level] || this.difficulties.medium
  }
}

// Main Game Class
class DinoGame {
  constructor() {
    this.gameState = new GameState()
    this.patternSystem = new ObstaclePatternSystem()
    this.difficultySystem = new DifficultySystem()

    // Game elements
    this.gameContainer = document.getElementById("game-container")
    this.playerElement = document.getElementById("player")
    this.scoreDisplay = document.getElementById("score")
    this.highScoreDisplay = document.getElementById("high-score")
    this.gameOverMessage = document.getElementById("game-over-message")
    this.ground = document.getElementById("ground")
    this.powerUpIndicator = document.getElementById("power-up-indicator")
    this.particlesContainer = document.getElementById("particles-container")
    this.clickEffectsContainer = document.getElementById("click-effects-container")
    this.difficultyIndicator = document.getElementById("difficulty-indicator")
    this.fpsCounter = document.getElementById("fps-counter")
    this.patternIndicator = document.getElementById("pattern-indicator")
    this.comboIndicator = document.getElementById("combo-indicator")

    // Game state
    this.score = 0
    this.highScore = 0
    this.isGameOver = false
    this.isPaused = false
    this.playerY = 0
    this.playerVelocityY = 0
    this.isJumping = false
    this.isDucking = false
    this.gravity = 1.5
    this.jumpStrength = 23
    this.gameSpeed = 5
    this.maxGameSpeed = 18
    this.gameSpeedAcceleration = 0.001

    // Combo system
    this.combo = 0
    this.comboTimer = 0
    this.comboDecayTime = 180 // frames

    // Timing and spawning
    this.obstacleSpawnTimer = 0
    this.initialObstacleSpawnInterval = 120
    this.obstacleSpawnInterval = this.initialObstacleSpawnInterval

    // Collections
    this.obstacles = []
    this.powerUps = []
    this.particles = []
    this.clickEffects = []

    // Player dimensions
    this.playerWidth = this.playerElement.offsetWidth
    this.playerHeight = this.playerElement.offsetHeight
    this.gameContainerWidth = this.gameContainer.offsetWidth
    this.gameContainerHeight = this.gameContainer.offsetHeight

    // Power-up state
    this.activePowerUp = null
    this.powerUpTimer = 0
    this.powerUpDuration = 500
    this.powerUpCollected = 0

    // Day/night cycle
    this.isDayTime = true
    this.dayNightTimer = 0
    this.dayNightCycleDuration = 1800

    // FPS tracking
    this.fps = 60
    this.frameCount = 0
    this.lastTime = performance.now()

    // Game session stats
    this.sessionStats = {
      jumps: 0,
      ducks: 0,
      obstaclesAvoided: 0,
      powerUpsCollected: 0,
      maxCombo: 0,
      startTime: Date.now(),
    }

    this.init()
  }

  init() {
    this.setupEventListeners()
    this.loadHighScore()
    this.showScreen("main-menu")
    this.updateDifficultyIndicator()
  }

  setupEventListeners() {
    // Menu navigation
    document.getElementById("start-game-btn").addEventListener("click", () => this.startGame())
    document.getElementById("achievements-btn").addEventListener("click", () => this.showAchievements())
    document.getElementById("settings-btn").addEventListener("click", () => this.showSettings())
    document.getElementById("back-to-menu").addEventListener("click", () => this.showScreen("main-menu"))
    document.getElementById("settings-back-btn").addEventListener("click", () => this.showScreen("main-menu"))

    // Character selection
    document.querySelectorAll(".character-option").forEach((option) => {
      option.addEventListener("click", (e) => {
        document.querySelectorAll(".character-option").forEach((o) => o.classList.remove("active"))
        option.classList.add("active")
        this.gameState.selectedCharacter = option.dataset.character
      })
    })

    // Difficulty selection
    document.querySelectorAll(".difficulty-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        document.querySelectorAll(".difficulty-btn").forEach((b) => b.classList.remove("active"))
        btn.classList.add("active")
        this.gameState.selectedDifficulty = btn.dataset.difficulty
        this.updateDifficultyIndicator()
      })
    })

    // Game controls
    document.addEventListener("keydown", (e) => this.handleKeyDown(e))
    document.addEventListener("keyup", (e) => this.handleKeyUp(e))

    // Click/touch controls
    this.gameContainer.addEventListener("pointerdown", (e) => this.handlePointerDown(e))
    this.gameContainer.addEventListener("pointerup", (e) => this.handlePointerUp(e))
    this.gameContainer.addEventListener("pointermove", (e) => this.handlePointerMove(e))

    // Pause menu
    document.getElementById("resume-btn").addEventListener("click", () => this.togglePause())
    document.getElementById("restart-btn").addEventListener("click", () => this.resetGame())
    document.getElementById("main-menu-btn").addEventListener("click", () => this.goToMainMenu())

    // Game over menu
    document.getElementById("restart-game-btn").addEventListener("click", () => this.resetGame())
    document.getElementById("menu-btn").addEventListener("click", () => this.goToMainMenu())

    // Settings
    document.getElementById("volume-slider").addEventListener("input", (e) => {
      this.gameState.settings.volume = Number.parseInt(e.target.value)
      document.getElementById("volume-value").textContent = e.target.value + "%"
      this.updateAudioVolume()
    })

    document.getElementById("graphics-quality").addEventListener("change", (e) => {
      this.gameState.settings.graphicsQuality = e.target.value
      this.updateGraphicsQuality()
    })

    document.getElementById("show-fps").addEventListener("change", (e) => {
      this.gameState.settings.showFPS = e.target.checked
      this.fpsCounter.style.display = e.target.checked ? "block" : "none"
    })

    // Window resize
    window.addEventListener("resize", () => this.handleResize())
  }

  showScreen(screenName) {
    document.querySelectorAll(".screen").forEach((screen) => {
      screen.style.display = "none"
    })
    document.getElementById(screenName).style.display = "flex"
    this.gameState.currentScreen = screenName
  }

  startGame() {
    this.showScreen("game-screen")
    this.resetGame()
    this.playerElement.className = `${this.gameState.selectedCharacter} running`
    this.gameLoop()
  }

  showAchievements() {
    this.showScreen("achievements-screen")
    this.renderAchievements()
  }

  showSettings() {
    this.showScreen("settings-screen")
    this.loadSettings()
  }

  renderAchievements() {
    const achievementsList = document.getElementById("achievements-list")
    achievementsList.innerHTML = ""

    for (const [key, achievement] of Object.entries(this.gameState.achievements.achievements)) {
      const achievementElement = document.createElement("div")
      achievementElement.className = `achievement-item ${achievement.unlocked ? "unlocked" : ""}`

      const progressPercent = Math.min(100, (achievement.progress / achievement.target) * 100)

      achievementElement.innerHTML = `
                <div class="achievement-icon">${achievement.unlocked ? "🏆" : "🔒"}</div>
                <div class="achievement-title">${achievement.title}</div>
                <div class="achievement-description">${achievement.description}</div>
                <div class="achievement-progress">
                    Progress: ${achievement.progress}/${achievement.target} (${progressPercent.toFixed(0)}%)
                </div>
            `

      achievementsList.appendChild(achievementElement)
    }
  }

  loadSettings() {
    document.getElementById("volume-slider").value = this.gameState.settings.volume
    document.getElementById("volume-value").textContent = this.gameState.settings.volume + "%"
    document.getElementById("graphics-quality").value = this.gameState.settings.graphicsQuality
    document.getElementById("show-fps").checked = this.gameState.settings.showFPS
    this.fpsCounter.style.display = this.gameState.settings.showFPS ? "block" : "none"
  }

  updateDifficultyIndicator() {
    const difficulty = this.difficultySystem.getDifficulty(this.gameState.selectedDifficulty)
    this.difficultyIndicator.textContent = `Difficulty: ${difficulty.name}`
  }

  updateAudioVolume() {
    // Update audio volume based on settings
    // In a real implementation, you'd update actual audio elements
  }

  updateGraphicsQuality() {
    // Adjust graphics quality based on settings
    const quality = this.gameState.settings.graphicsQuality
    if (quality === "low") {
      this.gameContainer.style.filter = "none"
    } else if (quality === "high") {
      this.gameContainer.style.filter = "drop-shadow(0 0 10px rgba(0,0,0,0.3))"
    }
  }

  handleKeyDown(e) {
    if (this.gameState.currentScreen !== "game-screen") return

    if (e.code === "Space" || e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
      e.preventDefault()
      if (this.isGameOver) {
        this.resetGame()
      } else {
        this.jump()
      }
    } else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
      e.preventDefault()
      this.startDuck()
    } else if (e.key === "p" || e.key === "P") {
      e.preventDefault()
      this.togglePause()
    } else if (e.key === "m" || e.key === "M") {
      e.preventDefault()
      this.toggleMute()
    }
  }

  handleKeyUp(e) {
    if (this.gameState.currentScreen !== "game-screen") return

    if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
      this.endDuck()
    }
  }

  handlePointerDown(e) {
    if (this.gameState.currentScreen !== "game-screen") return

    const rect = this.gameContainer.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top

    this.createClickEffect(clickX, clickY)

    if (this.isGameOver) {
      this.resetGame()
    } else {
      // Determine action based on click position
      if (clickY > this.gameContainerHeight / 2) {
        this.startDuck()
      } else {
        this.jump()
      }
    }
  }

  handlePointerUp(e) {
    if (this.isDucking) {
      this.endDuck()
    }
  }

  handlePointerMove(e) {
    // Could be used for gesture controls in the future
  }

  handleResize() {
    this.playerWidth = this.playerElement.offsetWidth
    this.playerHeight = this.playerElement.offsetHeight
    this.gameContainerWidth = this.gameContainer.offsetWidth
    this.gameContainerHeight = this.gameContainer.offsetHeight
  }

  createClickEffect(x, y) {
    const effect = document.createElement("div")
    effect.className = "click-effect"
    effect.style.left = `${x - 10}px`
    effect.style.top = `${y - 10}px`

    this.clickEffectsContainer.appendChild(effect)

    setTimeout(() => {
      if (effect.parentNode) {
        effect.parentNode.removeChild(effect)
      }
    }, 600)
  }

  loadHighScore() {
    const savedHighScore = localStorage.getItem("dinoGameHighScore")
    if (savedHighScore) {
      this.highScore = Number.parseInt(savedHighScore, 10)
    }
    this.highScoreDisplay.textContent = this.highScore
  }

  saveHighScore() {
    if (this.score > this.highScore) {
      this.highScore = this.score
      localStorage.setItem("dinoGameHighScore", this.highScore.toString())
      this.highScoreDisplay.textContent = this.highScore
    }
  }

  updateScore() {
    const difficulty = this.difficultySystem.getDifficulty(this.gameState.selectedDifficulty)
    const basePoints = 1
    const difficultyBonus = Math.floor(basePoints * difficulty.scoreMultiplier)
    const comboBonus = Math.floor(this.combo * 0.1)
    const powerUpBonus = this.activePowerUp === "double-points" ? difficultyBonus : 0

    const totalPoints = basePoints + difficultyBonus + comboBonus + powerUpBonus
    this.score += totalPoints
    this.scoreDisplay.textContent = this.score

    // Check achievements
    const newAchievements = this.gameState.achievements.checkAchievement("score", this.score, this.gameState.stats)

    // Increase game speed gradually
    if (this.gameSpeed < this.maxGameSpeed) {
      this.gameSpeed += this.gameSpeedAcceleration * difficulty.gameSpeedMultiplier
    }

    // Check for max speed achievement
    if (this.gameSpeed >= this.maxGameSpeed) {
      this.gameState.achievements.checkAchievement("maxSpeed", 1, this.gameState.stats)
    }

    // Shorten obstacle spawn interval as game speeds up
    this.obstacleSpawnInterval = Math.max(
      35,
      this.initialObstacleSpawnInterval * difficulty.obstacleSpawnRate - this.gameSpeed * 5,
    )

    const baseAnimationDuration = 0.8
    const newDuration = Math.max(0.1, baseAnimationDuration - this.gameSpeed * 0.03)
    this.ground.style.animationDuration = `${newDuration}s`
  }

  jump() {
    if (!this.isJumping && !this.isGameOver && !this.isPaused) {
      this.isJumping = true
      this.playerVelocityY = this.jumpStrength
      this.playerElement.classList.add("jumping")
      this.playerElement.classList.remove("running")

      if (this.isDucking) {
        this.endDuck()
      }

      this.sessionStats.jumps++
      this.gameState.stats.totalJumps++

      this.createParticles(
        5,
        Number.parseInt(this.playerElement.style.left) + this.playerWidth / 2,
        this.gameContainerHeight - 40,
        "#8B4513",
      )

      // Check achievements
      this.gameState.achievements.checkAchievement("jump", 1, this.gameState.stats)
    }
  }

  startDuck() {
    if (!this.isJumping && !this.isGameOver && !this.isPaused) {
      this.isDucking = true
      this.playerElement.classList.add("ducking")
      this.playerElement.classList.remove("running")

      this.playerHeight = this.playerElement.offsetHeight

      this.sessionStats.ducks++
      this.gameState.stats.totalDucks++

      // Check achievements
      this.gameState.achievements.checkAchievement("duck", 1, this.gameState.stats)
    }
  }

  endDuck() {
    if (this.isDucking && !this.isGameOver && !this.isPaused) {
      this.isDucking = false
      this.playerElement.classList.remove("ducking")
      if (!this.isJumping) {
        this.playerElement.classList.add("running")
      }

      this.playerHeight = this.playerElement.offsetHeight
    }
  }

  updatePlayer() {
    if (this.isJumping) {
      this.playerY += this.playerVelocityY
      this.playerVelocityY -= this.gravity

      if (this.playerY <= 0) {
        this.playerY = 0
        this.playerVelocityY = 0
        this.isJumping = false
        this.playerElement.classList.remove("jumping")
        if (!this.isGameOver && !this.isDucking) {
          this.playerElement.classList.add("running")
        }

        this.createParticles(
          8,
          Number.parseInt(this.playerElement.style.left) + this.playerWidth / 2,
          this.gameContainerHeight - 40,
          "#8B4513",
        )
      }
    }

    this.playerElement.style.transform = `translateY(${-this.playerY}px)`

    // Running animation
    if (!this.isJumping && !this.isDucking && !this.isGameOver) {
      if (!this.playerElement.classList.contains("running")) {
        this.playerElement.classList.add("running")
      }
    }
  }

  createObstacle() {
    // Check for pattern obstacles first
    const patternObstacle = this.patternSystem.getNextObstacle()
    if (patternObstacle) {
      return this.createPatternObstacle(patternObstacle)
    }

    const obstacleElement = document.createElement("div")
    let obsData = {}

    // Determine obstacle type based on difficulty and score
    const difficulty = this.difficultySystem.getDifficulty(this.gameState.selectedDifficulty)
    const isFlyingObstacle = Math.random() < 0.3 && this.score > 150

    if (isFlyingObstacle) {
      obstacleElement.classList.add("pterodactyl")
      const obsWidth = 50
      const obsHeight = 35

      const heightOptions = [
        this.playerHeight * 0.5, // Low - requires ducking
        this.playerHeight * 1.2, // Medium - can jump or duck
        this.playerHeight * 1.8, // High - requires jumping
      ]

      const obsBottom = heightOptions[Math.floor(Math.random() * heightOptions.length)]

      obstacleElement.style.width = `${obsWidth}px`
      obstacleElement.style.height = `${obsHeight}px`
      obstacleElement.style.left = `${this.gameContainerWidth}px`
      obstacleElement.style.bottom = `${obsBottom}px`

      obsData = {
        element: obstacleElement,
        x: this.gameContainerWidth,
        y: obsBottom,
        width: obsWidth,
        height: obsHeight,
        type: "pterodactyl",
      }
    } else {
      obstacleElement.classList.add("obstacle")

      // Add spiky obstacles on harder difficulties
      if (this.gameState.selectedDifficulty === "hard" || this.gameState.selectedDifficulty === "insane") {
        if (Math.random() < 0.3) {
          obstacleElement.classList.add("spiky")
        }
      }

      const type = Math.random()
      let obsWidth, obsHeight

      if (type < 0.4) {
        obsWidth = 30 + Math.random() * 20
        obsHeight = 30 + Math.random() * 10
      } else if (type < 0.7) {
        obsWidth = 20 + Math.random() * 10
        obsHeight = 45 + Math.random() * 25
      } else {
        obsWidth = (15 + Math.random() * 5) * (Math.floor(Math.random() * 2) + 1)
        obsHeight = 25 + Math.random() * 10
      }

      obstacleElement.style.width = `${obsWidth}px`
      obstacleElement.style.height = `${obsHeight}px`
      obstacleElement.style.left = `${this.gameContainerWidth}px`
      obstacleElement.style.bottom = `0px`

      obsData = {
        element: obstacleElement,
        x: this.gameContainerWidth,
        y: 0,
        width: obsWidth,
        height: obsHeight,
        type: "ground",
      }
    }

    this.obstacles.push(obsData)
    this.gameContainer.appendChild(obstacleElement)
  }

  createPatternObstacle(patternData) {
    const obstacleElement = document.createElement("div")

    if (patternData.type === "pterodactyl") {
      obstacleElement.classList.add("pterodactyl")
      obstacleElement.style.width = `${patternData.width}px`
      obstacleElement.style.height = `${patternData.height}px`
      obstacleElement.style.left = `${this.gameContainerWidth}px`
      obstacleElement.style.bottom = `${patternData.y}px`
    } else {
      obstacleElement.classList.add("obstacle")
      obstacleElement.style.width = `${patternData.width}px`
      obstacleElement.style.height = `${patternData.height}px`
      obstacleElement.style.left = `${this.gameContainerWidth}px`
      obstacleElement.style.bottom = `0px`
    }

    const obsData = {
      element: obstacleElement,
      x: this.gameContainerWidth,
      y: patternData.y || 0,
      width: patternData.width,
      height: patternData.height,
      type: patternData.type,
      isPattern: true,
    }

    this.obstacles.push(obsData)
    this.gameContainer.appendChild(obstacleElement)
  }

  createPowerUp() {
    const difficulty = this.difficultySystem.getDifficulty(this.gameState.selectedDifficulty)

    if (this.score < 300 || Math.random() > difficulty.powerUpChance) return

    const powerUpElement = document.createElement("div")
    powerUpElement.classList.add("power-up")

    const powerUpTypes = ["shield", "slow-motion", "invincibility", "double-points"]
    const powerUpType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)]
    powerUpElement.classList.add(powerUpType)

    const powerUpWidth = 30
    const powerUpHeight = 30
    const powerUpBottom = 50 + Math.random() * 100

    powerUpElement.style.width = `${powerUpWidth}px`
    powerUpElement.style.height = `${powerUpHeight}px`
    powerUpElement.style.left = `${this.gameContainerWidth}px`
    powerUpElement.style.bottom = `${powerUpBottom}px`

    const powerUpData = {
      element: powerUpElement,
      x: this.gameContainerWidth,
      y: powerUpBottom,
      width: powerUpWidth,
      height: powerUpHeight,
      type: powerUpType,
    }

    this.powerUps.push(powerUpData)
    this.gameContainer.appendChild(powerUpElement)
  }

  activatePowerUp(type) {
    this.activePowerUp = type
    this.powerUpTimer = this.powerUpDuration
    this.powerUpCollected++

    if (type === "shield") {
      this.playerElement.classList.add("shield")
      this.powerUpIndicator.textContent = "Shield Active"
      this.powerUpIndicator.style.backgroundColor = "rgba(0, 191, 255, 0.5)"
    } else if (type === "slow-motion") {
      this.gameContainer.classList.add("slow-motion")
      this.gameSpeed *= 0.5
      this.powerUpIndicator.textContent = "Slow Motion"
      this.powerUpIndicator.style.backgroundColor = "rgba(153, 50, 204, 0.5)"
    } else if (type === "invincibility") {
      this.playerElement.classList.add("invincible")
      this.powerUpIndicator.textContent = "Invincible"
      this.powerUpIndicator.style.backgroundColor = "rgba(255, 215, 0, 0.5)"
    } else if (type === "double-points") {
      this.gameContainer.classList.add("double-points")
      this.powerUpIndicator.textContent = "Double Points"
      this.powerUpIndicator.style.backgroundColor = "rgba(50, 205, 50, 0.5)"
    }

    this.powerUpIndicator.style.display = "block"

    // Check achievements
    this.gameState.achievements.checkAchievement("powerUp", this.powerUpCollected, this.gameState.stats)
  }

  deactivatePowerUp() {
    if (this.activePowerUp === "shield") {
      this.playerElement.classList.remove("shield")
    } else if (this.activePowerUp === "slow-motion") {
      this.gameContainer.classList.remove("slow-motion")
      this.gameSpeed *= 2
    } else if (this.activePowerUp === "invincibility") {
      this.playerElement.classList.remove("invincible")
    } else if (this.activePowerUp === "double-points") {
      this.gameContainer.classList.remove("double-points")
    }

    this.activePowerUp = null
    this.powerUpIndicator.style.display = "none"
  }

  updatePowerUps() {
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const powerUp = this.powerUps[i]
      powerUp.x -= this.gameSpeed
      powerUp.element.style.left = `${powerUp.x}px`

      if (powerUp.x + powerUp.width < 0) {
        powerUp.element.remove()
        this.powerUps.splice(i, 1)
      }
    }

    if (!this.isGameOver) {
      const playerRect = this.getPlayerHitbox()

      for (let i = this.powerUps.length - 1; i >= 0; i--) {
        const powerUp = this.powerUps[i]
        const powerUpRect = {
          x: powerUp.x,
          y: powerUp.y,
          width: powerUp.width,
          height: powerUp.height,
        }

        if (this.checkRectCollision(playerRect, powerUpRect)) {
          this.activatePowerUp(powerUp.type)
          powerUp.element.remove()
          this.powerUps.splice(i, 1)
          this.createParticles(10, powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2, "#FFD700")
        }
      }
    }

    if (this.activePowerUp) {
      this.powerUpTimer--
      if (this.powerUpTimer <= 0) {
        this.deactivatePowerUp()
      }
    }
  }

  createParticles(count, x, y, color) {
    for (let i = 0; i < count; i++) {
      const particle = document.createElement("div")
      particle.classList.add("particle")
      particle.style.backgroundColor = color
      particle.style.left = `${x}px`
      particle.style.bottom = `${y}px`

      const angle = Math.random() * Math.PI * 2
      const speed = 1 + Math.random() * 3
      const size = 2 + Math.random() * 4

      particle.style.width = `${size}px`
      particle.style.height = `${size}px`

      const particleData = {
        element: particle,
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 0.1,
        life: 30 + Math.random() * 20,
      }

      this.particles.push(particleData)
      this.particlesContainer.appendChild(particle)
    }
  }

  updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i]

      particle.x += particle.vx
      particle.y += particle.vy
      particle.vy -= particle.gravity

      particle.element.style.left = `${particle.x}px`
      particle.element.style.bottom = `${particle.y}px`

      particle.life--

      if (particle.life <= 0) {
        particle.element.remove()
        this.particles.splice(i, 1)
      }
    }
  }

  updateObstacles() {
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i]
      obs.x -= this.gameSpeed
      obs.element.style.left = `${obs.x}px`

      if (obs.x + obs.width < 0) {
        obs.element.remove()
        this.obstacles.splice(i, 1)

        // Increment combo and obstacles avoided
        this.combo++
        this.comboTimer = this.comboDecayTime
        this.sessionStats.obstaclesAvoided++
        this.gameState.stats.totalObstaclesAvoided++

        // Update combo display
        this.updateComboDisplay()

        // Check achievements
        this.gameState.achievements.checkAchievement("obstacle", 1, this.gameState.stats)
        this.gameState.achievements.checkAchievement("combo", this.combo, this.gameState.stats)

        if (this.combo > this.sessionStats.maxCombo) {
          this.sessionStats.maxCombo = this.combo
        }
      }
    }

    // Update combo timer
    if (this.combo > 0) {
      this.comboTimer--
      if (this.comboTimer <= 0) {
        this.combo = 0
        this.updateComboDisplay()
      }
    }

    // Spawn new obstacles
    this.obstacleSpawnTimer++
    if (this.obstacleSpawnTimer >= this.obstacleSpawnInterval) {
      this.createObstacle()
      this.obstacleSpawnTimer = 0

      // Chance to spawn a power-up
      if (Math.random() < 0.2) {
        this.createPowerUp()
      }
    }
  }

  updateComboDisplay() {
    if (this.combo > 0) {
      this.comboIndicator.style.display = "block"
      document.getElementById("combo-count").textContent = this.combo
    } else {
      this.comboIndicator.style.display = "none"
    }
  }

  updatePatternSystem() {
    const patternCompleted = this.patternSystem.update()

    if (patternCompleted) {
      // Check for perfect pattern completion
      this.gameState.achievements.checkAchievement("perfectPattern", 1, this.gameState.stats)
      this.patternIndicator.style.display = "none"
    }

    if (this.patternSystem.shouldTriggerPattern(this.score, this.gameSpeed)) {
      const pattern = this.patternSystem.startPattern()
      if (pattern) {
        this.showPatternWarning(pattern.warning)
      }
    }

    if (this.patternSystem.currentPattern) {
      this.patternIndicator.style.display = "block"
      this.patternIndicator.textContent = this.patternSystem.currentPattern.name
    }
  }

  showPatternWarning(warningText) {
    const warning = document.createElement("div")
    warning.className = "pattern-warning"
    warning.textContent = warningText
    this.gameContainer.appendChild(warning)

    setTimeout(() => {
      if (warning.parentNode) {
        warning.parentNode.removeChild(warning)
      }
    }, 2000)
  }

  getPlayerHitbox() {
    const hitboxWidth = this.playerWidth * 0.8
    let hitboxHeight = this.playerHeight * 0.9
    const hitboxOffsetX = this.playerWidth * 0.1
    let hitboxOffsetY = 0

    if (this.isDucking) {
      hitboxHeight = this.playerHeight * 0.7
      hitboxOffsetY = this.playerHeight * 0.1
    }

    return {
      x: Number.parseInt(this.playerElement.style.left) + hitboxOffsetX,
      y: this.playerY + hitboxOffsetY,
      width: hitboxWidth,
      height: hitboxHeight,
    }
  }

  checkRectCollision(rect1, rect2) {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    )
  }

  checkCollision() {
    if (this.activePowerUp === "shield" || this.activePowerUp === "invincibility") return false

    const playerRect = this.getPlayerHitbox()

    for (const obs of this.obstacles) {
      const obsRect = {
        x: obs.x + obs.width * 0.1,
        y: obs.y,
        width: obs.width * 0.8,
        height: obs.height * 0.8,
      }

      if (this.checkRectCollision(playerRect, obsRect)) {
        return true
      }
    }
    return false
  }

  updateDayNightCycle() {
    this.dayNightTimer++
    if (this.dayNightTimer >= this.dayNightCycleDuration) {
      this.toggleDayNight()
      this.dayNightTimer = 0
    }
  }

  toggleDayNight() {
    this.isDayTime = !this.isDayTime
    if (this.isDayTime) {
      this.gameContainer.classList.remove("night-mode")
    } else {
      this.gameContainer.classList.add("night-mode")
      // Check night mode achievement
      this.gameState.achievements.checkAchievement("nightMode", 1, this.gameState.stats)
    }
  }

  updateFPS() {
    this.frameCount++
    const currentTime = performance.now()

    if (currentTime - this.lastTime >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime))
      document.getElementById("fps").textContent = this.fps
      this.frameCount = 0
      this.lastTime = currentTime
    }
  }

  gameOver() {
    this.isGameOver = true
    this.saveHighScore()

    // Update session stats
    this.sessionStats.powerUpsCollected = this.powerUpCollected

    // Update global stats
    this.gameState.stats.totalGamesPlayed++
    this.gameState.stats.totalScore += this.score
    this.gameState.stats.totalPlayTime += Math.floor((Date.now() - this.sessionStats.startTime) / 1000)
    if (this.combo > this.gameState.stats.longestCombo) {
      this.gameState.stats.longestCombo = this.combo
    }

    // Check difficulty-specific achievements
    if (this.gameState.selectedDifficulty === "hard") {
      this.gameState.achievements.checkAchievement("hardDifficulty", 1, this.gameState.stats)
    } else if (this.gameState.selectedDifficulty === "insane" && this.score >= 1000) {
      this.gameState.achievements.checkAchievement("insaneDifficulty", this.score, this.gameState.stats)
    }

    // Check play time achievement
    this.gameState.achievements.checkAchievement("playTime", this.gameState.stats.totalPlayTime, this.gameState.stats)

    // Save all data
    this.gameState.saveData()

    // Show game over screen
    this.showGameOverScreen()

    // Stop animations
    this.ground.style.animationPlayState = "paused"
    this.playerElement.classList.remove("running", "jumping", "ducking")

    // Deactivate power-ups
    if (this.activePowerUp) {
      this.deactivatePowerUp()
    }

    // Create explosion particles
    this.createParticles(
      20,
      Number.parseInt(this.playerElement.style.left) + this.playerWidth / 2,
      this.gameContainerHeight - this.playerHeight / 2,
      "#FF6347",
    )
  }

  showGameOverScreen() {
    const finalStats = document.getElementById("final-stats")
    const newAchievements = document.getElementById("new-achievements")

    finalStats.innerHTML = `
            <h3>Final Stats</h3>
            <p>Score: ${this.score}</p>
            <p>Jumps: ${this.sessionStats.jumps}</p>
            <p>Ducks: ${this.sessionStats.ducks}</p>
            <p>Obstacles Avoided: ${this.sessionStats.obstaclesAvoided}</p>
            <p>Max Combo: ${this.sessionStats.maxCombo}</p>
            <p>Power-ups Collected: ${this.sessionStats.powerUpsCollected}</p>
            <p>Difficulty: ${this.difficultySystem.getDifficulty(this.gameState.selectedDifficulty).name}</p>
        `

    // Show new achievements if any
    const unlockedAchievements = Object.values(this.gameState.achievements.achievements).filter(
      (a) => a.unlocked && a.progress === a.target,
    )

    if (unlockedAchievements.length > 0) {
      newAchievements.innerHTML = `
                <h4>🏆 New Achievements Unlocked!</h4>
                ${unlockedAchievements.map((a) => `<p>• ${a.title}: ${a.description}</p>`).join("")}
            `
      newAchievements.style.display = "block"
    } else {
      newAchievements.style.display = "none"
    }

    this.gameOverMessage.style.display = "flex"
  }

  togglePause() {
    if (this.isGameOver) return

    this.isPaused = !this.isPaused

    if (this.isPaused) {
      document.getElementById("pause-screen").style.display = "flex"
      this.ground.style.animationPlayState = "paused"
    } else {
      document.getElementById("pause-screen").style.display = "none"
      this.ground.style.animationPlayState = "running"
      this.gameLoop()
    }
  }

  toggleMute() {
    // Toggle mute functionality
    // In a real implementation, you'd mute actual audio elements
  }

  goToMainMenu() {
    this.showScreen("main-menu")
    this.isPaused = false
    this.isGameOver = false
    document.getElementById("pause-screen").style.display = "none"
    document.getElementById("game-over-message").style.display = "none"
  }

  gameLoop() {
    if (this.isGameOver || this.isPaused) {
      return
    }

    this.updatePlayer()
    this.updateObstacles()
    this.updatePowerUps()
    this.updateParticles()
    this.updateDayNightCycle()
    this.updatePatternSystem()
    this.updateFPS()

    if (this.checkCollision()) {
      this.gameOver()
      return
    }

    this.updateScore()
    requestAnimationFrame(() => this.gameLoop())
  }

  resetGame() {
    // Reset game state
    this.score = 0
    this.isGameOver = false
    this.isPaused = false
    this.playerY = 0
    this.playerVelocityY = 0
    this.isJumping = false
    this.isDucking = false
    this.gameSpeed = 5
    this.obstacleSpawnTimer = 0
    this.obstacleSpawnInterval = this.initialObstacleSpawnInterval
    this.combo = 0
    this.comboTimer = 0
    this.powerUpCollected = 0

    // Reset session stats
    this.sessionStats = {
      jumps: 0,
      ducks: 0,
      obstaclesAvoided: 0,
      powerUpsCollected: 0,
      maxCombo: 0,
      startTime: Date.now(),
    }

    // Clear obstacles
    this.obstacles.forEach((obs) => obs.element.remove())
    this.obstacles.length = 0

    // Clear power-ups
    this.powerUps.forEach((powerUp) => powerUp.element.remove())
    this.powerUps.length = 0

    // Clear particles
    this.particles.forEach((particle) => particle.element.remove())
    this.particles.length = 0

    // Reset power-up state
    if (this.activePowerUp) {
      this.deactivatePowerUp()
    }

    // Reset pattern system
    this.patternSystem.currentPattern = null
    this.patternSystem.patternProgress = 0
    this.patternSystem.patternTimer = 0

    // Reset UI
    this.scoreDisplay.textContent = this.score
    this.loadHighScore()
    document.getElementById("game-over-message").style.display = "none"
    document.getElementById("pause-screen").style.display = "none"
    this.patternIndicator.style.display = "none"
    this.updateComboDisplay()

    // Reset player
    this.playerElement.style.transform = `translateY(0px)`
    this.playerElement.className = `${this.gameState.selectedCharacter} running`
    this.playerElement.style.bottom = `0px`
    this.playerElement.style.left = `60px`

    // Reset animation
    this.ground.style.animationPlayState = "running"
    const currentInitialGroundAnimationDuration = 0.8 - this.gameSpeed * 0.03
    this.ground.style.animationDuration = `${currentInitialGroundAnimationDuration}s`

    // Apply difficulty settings
    const difficulty = this.difficultySystem.getDifficulty(this.gameState.selectedDifficulty)
    this.gameSpeed *= difficulty.gameSpeedMultiplier
    this.obstacleSpawnInterval *= difficulty.obstacleSpawnRate

    this.gameLoop()
  }
}

// Initialize the game when the page loads
document.addEventListener("DOMContentLoaded", () => {
  new DinoGame()
})

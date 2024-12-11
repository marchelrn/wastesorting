class MainMenu extends Phaser.Scene {
  constructor() {
    super({ key: "MainMenu" });
    this.assetsLoaded = false;
  }

  preload() {
    console.log("MainMenu: Loading assets...");

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 4, height / 2 - 30, width / 2, 50);

    this.load.on("progress", (value) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(
        width / 4 + 10,
        height / 2 - 20,
        (width / 2 - 20) * value,
        30
      );
    });

    this.load.on("complete", () => {
      progressBar.destroy();
      progressBox.destroy();
      this.assetsLoaded = true;
      console.log("MainMenu: All assets loaded");
    });

    this.load.image("menuBackground", "assets/orchard.png");
    this.load.image("playButton", "assets/play_button.png");
    this.load.image("exitButton", "assets/Exit_button.png");
    this.load.image("text_title", "assets/main_menu_text.png");
    this.load.audio("background_music", "assets/back_sound.mp3");
  }

  create() {
    this.input.on("pointerdown", (pointer) => {
      console.log("Pointer down detected globally at:", pointer.x, pointer.y);
    });
    this.input.setDefaultCursor("url(assets/hand.png), pointer");
    console.log("MainMenu: Scene created");
    const { width, height } = this.scale;

    const background = this.add.image(width / 2, height / 2, "menuBackground");
    background.setDisplaySize(width, height);

    const titleText = this.add
      .image(width / 2, height / 2 - 150, "text_title")
      .setDisplaySize(300, 125);

    const playButton = this.add
      .image(width / 2, height / 2 + 50, "playButton")
      .setInteractive()
      .setDisplaySize(250, 100);

    playButton.on("pointerdown", () => {
      if (this.assetsLoaded) {
        console.log("MainMenu: Starting Example scene (Level 1)");
        this.scene.start("Example", { level: 1 }); // Mulai dari Level 1
      } else {
        console.warn("MainMenu: Assets not fully loaded yet");
      }
    });

    // Tombol Exit
    const exitButton = this.add
      .image(width / 2, height / 2 + 150, "exitButton")
      .setInteractive()
      .setDisplaySize(250, 100);

    exitButton.on("pointerdown", () => {
      console.log("MainMenu: Exit clicked");
      window.close();
    });
  }
}

class Example extends Phaser.Scene {
  constructor() {
    super({ key: "Example" });
    this.level = 1;
    this.score = 0;
    this.timeRemaining = 30;
    this.baseDropSpeed = 150;
    this.anorganikWaste = [];
    this.organikWaste = [];
    this.b3Waste = [];

    // Define target scores for each level
    this.levelTargets = {
      1: 250,
      2: 300,
      3: 400,
      4: 500,
      5: 550,
    };
  }

  init(data) {
    console.log("Example: Received data:", data);
    this.level = data.level || 1;
    this.score = data.score || 0;
    console.log(`Initialized with Level: ${this.level}, Score: ${this.score}`);
    if (data && data.level) {
      this.level = data.level; // Atur level sesuai parameter yang diterima
      console.log(`Starting at level: ${this.level}`);
    } else {
      this.level = 1; // Default ke Level 1
      console.log("No level data provided. Starting at level 1.");
    }
  }

  preload() {
    // Loading screen
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 4, height / 2 - 30, width / 2, 50);

    // Loading progress event
    this.load.on("progress", (value) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(
        width / 4 + 10,
        height / 2 - 20,
        (width / 2 - 20) * value,
        30
      );
    });

    this.load.on("complete", () => {
      progressBar.destroy();
      progressBox.destroy();
    });

    // Load with error handling
    try {
      // Load assets with full paths
      const assetPath = "assets/";

      // Anorganik waste
      this.load.image("anorganik1", `${assetPath}anorganik1.png`);
      this.load.image("anorganik2", `${assetPath}anorganik2.png`);
      this.load.image("anorganik3", `${assetPath}anorganik3.png`);

      // Organik waste
      this.load.image("organik1", `${assetPath}organik1.png`);
      this.load.image("organik2", `${assetPath}organik2.png`);
      this.load.image("organik3", `${assetPath}organik3.png`);

      // B3 waste
      this.load.image("b3_1", `${assetPath}b3_1.png`);
      this.load.image("b3_2", `${assetPath}b3_2.png`);
      this.load.image("b3_3", `${assetPath}b3_3.png`);

      // Bins
      this.load.image("anorganik_bin", `${assetPath}anorganik.png`);
      this.load.image("organik_bin", `${assetPath}organik.png`);
      this.load.image("b3_bin", `${assetPath}B3.png`);

      // Background , music and menu
      this.load.image("game_background", `${assetPath}game_background.jpg`);
      this.load.audio("background_music", `${assetPath}music.mp3`);
      this.load.image("menu_button", `${assetPath}menu_button.png`);
    } catch (error) {
      console.error("Error loading assets:", error);
    }
  }

  create() {
    // Verify assets loaded
    if (!this.textures.exists("game_background")) {
      console.error("Required assets not loaded");
      this.add
        .text(
          this.scale.width / 2,
          this.scale.height / 2,
          "Error loading game assets",
          {
            fontSize: "24px",
            fill: "#fff",
          }
        )
        .setOrigin(0.5);
      return;
    }

    this.timeRemaining = Math.max(30, 60 - (this.level - 1) * 5); // Level 5 = 30 detik
    this.targetScore = this.levelTargets[this.level]; // Level 5 = 2000
    this.baseDropSpeed += (this.level - 1) * 50; // Kecepatan meningkat per level

    console.log(
      `Level: ${this.level}, Time Remaining: ${this.timeRemaining}, Target Score: ${this.targetScore}`
    );

    // Continue with normal scene creation
    const { width, height } = this.scale;
    this.createBackground(width, height);
    this.timeRemaining = 60;
    this.targetScore = 250;
    this.createDustbins();
    this.createWasteItems();
    this.createTimer();
    this.createScoreText();
    this.createLevelText();
    this.createTargetScoreText();

    // Add background music with error handling
    try {
      this.backgroundMusic = this.sound.add("background_music", {
        loop: true,
        volume: 0.1,
      });
      this.backgroundMusic.play();
      this.sound.pauseOnBlur = false;
    } catch (error) {
      console.warn("Background music failed to load:", error);
    }

    // Create a menu button in the upper-right corner
    const menuButton = this.add
      .image(330, 25, "menu_button")
      .setInteractive()
      .setOrigin(0.5) // Set the origin to the center of the image
      .setDisplaySize(40, 40)
      .on("pointerdown", () => {
        console.log("Game paused. Opening MenuScene...");
        this.scene.pause("Example"); // Jeda game
        this.scene.launch("MenuScene", {
          backgroundMusic: this.backgroundMusic, // Kirim musik latar ke MenuScene
        });
      });
  }

  showMenu() {
    // Jeda scene Example
    this.scene.pause(); // Menjeda scene Example
    this.scene.launch("MenuScene", {
      backgroundMusic: this.backgroundMusic, // Kirim referensi musik
      musicPlaying: this.backgroundMusic
        ? this.backgroundMusic.isPlaying
        : false,
    });
  }

  createBackground(width, height) {
    const background = this.add.image(width / 2, height / 2, "game_background");
    const scaleX = width / background.width;
    const scaleY = height / background.height;
    const scale = Math.max(scaleX, scaleY);
    background.setScale(scale); // Menyesuaikan agar background memenuhi layar
  }

  createDustbins() {
    const { width, height } = this.scale;
    const binWidth = 100;
    const binHeight = 250;

    const dustbinY = height - 150;

    this.dustbins = {
      anorganik: this.add
        .image(width * 0.2, height - 50, "anorganik_bin")
        .setDisplaySize(binWidth, binHeight)
        .setInteractive(),
      organik: this.add
        .image(width * 0.5, height - 50, "organik_bin")
        .setDisplaySize(binWidth, binHeight)
        .setInteractive(),
      b3: this.add
        .image(width * 0.8, height - 50, "b3_bin")
        .setDisplaySize(binWidth, binHeight)
        .setInteractive(),
    };

    Object.keys(this.dustbins).forEach((type) => {
      this.add
        .text(
          this.dustbins[type].x,
          this.dustbins[type].y + binHeight / 2 + 20,
          {
            fontSize: "16px",
            fill: "#fff",
          }
        )
        .setOrigin(0.5);
    });
  }

  createWasteItems() {
    const { width } = this.scale;

    // Define waste types with their corresponding images and categories
    const wasteTypes = [
      { key: "anorganik1", type: "anorganik" },
      { key: "anorganik2", type: "anorganik" },
      { key: "anorganik3", type: "anorganik" },
      { key: "organik1", type: "organik" },
      { key: "organik2", type: "organik" },
      { key: "organik3", type: "organik" },
      { key: "b3_1", type: "b3" },
      { key: "b3_2", type: "b3" },
      { key: "b3_3", type: "b3" },
    ];

    // Clear existing waste arrays
    this.anorganikWaste = [];
    this.organikWaste = [];
    this.b3Waste = [];
    this.wasteItems = [];

    const wasteSize = {
      width: 80,
      height: 80,
    };

    // Create waste items
    for (let i = 0; i < this.timeRemaining; i++) {
      const randomWaste =
        wasteTypes[Math.floor(Math.random() * wasteTypes.length)];
      const x = Phaser.Math.Between(50, width - 50);

      const waste = this.physics.add.image(x, -50, randomWaste.key);

      // Calculate scale to achieve consistent size
      waste.setDisplaySize(wasteSize.width, wasteSize.height);

      waste.setBounce(0.2);
      waste.setCollideWorldBounds(true);
      waste.setData("type", randomWaste.type);
      waste.setVisible(false);

      // Store waste in appropriate array
      switch (randomWaste.type) {
        case "anorganik":
          this.anorganikWaste.push(waste);
          break;
        case "organik":
          this.organikWaste.push(waste);
          break;
        case "b3":
          this.b3Waste.push(waste);
          break;
      }

      this.wasteItems.push(waste);
      this.setupDragEvents(waste);
    }

    // Drop items periodically
    this.time.addEvent({
      delay: 1000,
      callback: this.dropNextItem,
      callbackScope: this,
      loop: true,
    });
  }

  dropNextItem() {
    if (this.wasteItems.length > 0) {
      const waste = this.wasteItems.shift();
      waste.setVisible(true);
      waste.setPosition(waste.x, 0);
      waste.setVelocityY(this.baseDropSpeed + (this.level - 1) * 50); // Misalnya, bertambah 20 per level

      console.log("Sampah jatuh ke Y:", waste.y);
      // Cek apakah sampah sudah jatuh ke tanah (misalnya, mencapai bagian bawah layar)
      waste.once("worldbounds", () => {
        if (waste.y >= this.scale.height - 100) {
          // Jika sampah sudah berada di bagian bawah
          waste.destroy(); // Menghapus sampah dari dunia
        }
      });
    }
  }

  setupDragEvents(waste) {
    waste.setInteractive();
    this.input.setDraggable(waste);

    waste.touchedGround = false;

    waste.on("dragstart", (pointer) => {
      // Hanya bisa di-drag jika belum menyentuh dasar
      if (waste.touchedGround) {
        return;
      }
      waste.body.setVelocity(0);
      waste.input.dragStartX = waste.x;
      waste.input.dragStartY = waste.y;
    });

    waste.on("drag", (pointer, dragX, dragY) => {
      // Hanya bisa di-drag jika belum menyentuh dasar
      if (!waste.touchedGround) {
        waste.x = dragX;
        waste.y = dragY;
      }
    });

    waste.on("dragend", () => {
      // Cek apakah sampah berada di bawah layar
      if (waste.y >= this.scale.height - 50) {
        waste.touchedGround = true; // Tandai bahwa sampah sudah menyentuh dasar
      } else {
        this.checkWasteCollection(waste);
      }
    });
  }

  endLevel() {
    this.level++; // Meningkatkan level setelah selesai
    if (this.level > 5) {
      // Jika level lebih dari 5, game selesai
      this.gameCompleted();
    } else {
      if (this.backgroundMusic) {
        this.backgroundMusic.stop();
      }

      // Pause scene sebelum transisi level
      this.scene.pause();

      // Verifikasi dengan benar sebelum melanjutkan ke scene transisi level
      this.scene.launch("LevelTransition", {
        level: this.level - 1, // Menampilkan level sebelumnya karena level sudah bertambah
        score: this.score, // Kirim score sebelumnya
      });
    }
  }

  startNewLevel() {
    this.timeRemaining = Math.max(30, 60 + (this.level - 1) * 5);
    this.targetScore = this.levelTargets[this.level];
    this.baseDropSpeed += 20; // meningkatkan kecepatan setiap level
    this.score = 0; // Reset score to 0 at the beginning of each new level
    this.levelText.setText("Level: " + this.level);
    this.scoreText.setText("Score: " + this.score);
    this.targetScoreText.setText("Target: " + this.targetScore);
    this.createWasteItems(); // Create new waste items for the next level
  }

  checkWasteCollection(waste) {
    const wasteType = waste.getData("type");
    let isCorrect = false;

    for (let dustbinType in this.dustbins) {
      if (
        Phaser.Geom.Intersects.RectangleToRectangle(
          waste.getBounds(),
          this.dustbins[dustbinType].getBounds()
        )
      ) {
        if (dustbinType === wasteType) {
          // Jika benar, tambah poin 10
          const points = 10;
          this.score += points;
          isCorrect = true;
          this.showFeedback(`Correct! +${points}`, "#00ff00");
        } else {
          // Jika salah, kurangi poin 5
          const penalty = 5;
          this.score = Math.max(0, this.score - penalty); // Tidak membiarkan skor menjadi negatif
          this.showFeedback(`Wrong bin! -${penalty}`, "#ff0000");
        }

        this.scoreText.setText("Score: " + this.score);
        waste.destroy();

        const wasteArrayName = `${wasteType}Waste`;
        if (this[wasteArrayName] && Array.isArray(this[wasteArrayName])) {
          const index = this[wasteArrayName].indexOf(waste);
          if (index > -1) {
            this[wasteArrayName].splice(index, 1);
          }
        }

        // **Check if reached level target**
        if (this.score >= this.levelTargets[this.level]) {
          console.log("Target score reached! Level transitioning...");
          this.endLevel(); // Trigger level transition when score reaches target
        }
        return;
      }
    }

    // Kembalikan sampah ke posisi awal jika tidak tepat
    if (!isCorrect) {
      waste.x = waste.input.dragStartX;
      waste.y = waste.input.dragStartY;
    }
  }

  createTargetScoreText() {
    this.targetScoreText = this.add.text(
      16,
      118,
      "Target: " + this.levelTargets[this.level],
      {
        fontFamily: "Tiny5",
        fontSize: "32px",
        fill: "#ffff",
        stroke: "#00000",
        strokeThickness: 6,
      }
    );
  }

  showFeedback(message, color) {
    const feedbackText = this.add
      .text(this.scale.width / 2, this.scale.height / 2, message, {
        fontFamily: "Tiny5",
        fontSize: "32px",
        fill: color,
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: feedbackText,
      y: feedbackText.y - 50,
      alpha: 0,
      duration: 1000,
      ease: "Power2",
      onComplete: () => {
        feedbackText.destroy();
      },
    });
  }

  createTimer() {
    this.timerText = this.add.text(16, 16, "Time: 60", {
      fontFamily: "Tiny5",
      fontSize: "32px",
      fill: "#fff ",
      stroke: "#00000",
      strokeThickness: 6,
    });
    this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true,
    });
  }

  updateTimer() {
    this.timeRemaining--;
    this.timerText.setText("Time: " + this.timeRemaining);
    if (this.timeRemaining <= 0) {
      this.gameOver();
    }
  }

  createScoreText() {
    this.scoreText = this.add.text(16, 50, "Score: " + this.score, {
      fontFamily: "Tiny5",
      fontSize: "32px",
      fill: "#fff",
      stroke: "#00000",
      strokeThickness: 6,
    });
  }

  createLevelText() {
    this.levelText = this.add.text(16, 84, "Level: " + this.level, {
      fontFamily: "Tiny5",
      fontSize: "32px",
      fill: "#ffff",
      stroke: "#00000",
      strokeThickness: 6,
    });
  }

  gameCompleted() {
    if (this.backgroundMusic) {
      this.backgroundMusic.stop(); // Hentikan musik latar
    }
    this.scene.pause(); // Hentikan scene saat ini

    // Pindah ke scene GameComplete dengan data skor
    this.scene.start("GameComplete", {
      score: this.score, // Kirim skor akhir ke scene GameComplete
    });
  }

  gameOver() {
    if (this.backgroundMusic) {
      this.backgroundMusic.stop(); // Stop background music if playing
    }

    // Transition to the GameOver scene and pass relevant data
    this.scene.start("GameOver", { level: this.level, score: this.score });
  }
}

class GameOver extends Phaser.Scene {
  constructor() {
    super({ key: "GameOver" });
  }

  init(data) {
    // Receive data such as level, score, etc.
    this.finalLevel = data.level || 1;
    this.finalScore = data.score || 0;
  }

  create() {
    const { width, height } = this.scale;

    // Add a background overlay
    const background = this.add.image(width / 2, height / 2, "menuBackground");
    background.setDisplaySize(width, height);

    // Display "Game Over" text
    this.add
      .text(
        width / 2,
        height / 2 - 100,
        `Game Over!\nYou reached Level ${this.finalLevel}\nFinal Score: ${this.finalScore}`,
        {
          fontFamily: "Tiny5",
          fontSize: "30px",
          fill: "#fff",
          align: "center",
          stroke: "#000000",
          strokeThickness: 6,
        }
      )
      .setOrigin(0.5);

    // Create a restart button
    const restartBtn = this.add
      .rectangle(width / 2, height / 2 + 50, 200, 50, 0x006400)
      .setInteractive({ useHandCursor: true })
      .setOrigin(0.5);

    // Add text to the restart button
    this.add
      .text(width / 2, height / 2 + 50, "Restart Game", {
        fontFamily: "Tiny5",
        fontSize: "24px",
        fill: "#fff",
        align: "center",
        stroke: "#00000",
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    // Restart button interaction
    restartBtn.on("pointerdown", () => {
      console.log("Restart button clicked! Restarting Example scene...");
      this.scene.stop("GameOver");
      this.scene.start("Example", { level: 1, score: 0 });
    });

    restartBtn.on("pointerover", () => {
      this.tweens.add({
        targets: restartBtn,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 200,
        ease: "Power1",
      });
    });
    restartBtn.on("pointerout", () => {
      this.tweens.add({
        targets: restartBtn,
        scaleX: 1,
        scaleY: 1,
        duration: 200,
        ease: "Power1",
      });
    });

    // Create a main menu button (optional)
    const mainMenuBtn = this.add
      .rectangle(width / 2, height / 2 + 120, 200, 50, 0x5d1a1a)
      .setInteractive({ useHandCursor: true })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 + 120, "Main Menu", {
        fontFamily: "Tiny5",
        fontSize: "24px",
        fill: "#ffffff",
        align: "center",
        stroke: "#00000",
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    mainMenuBtn.on("pointerover", () => {
      this.tweens.add({
        targets: mainMenuBtn,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 200,
        ease: "Power1",
      });
    });
    mainMenuBtn.on("pointerout", () => {
      this.tweens.add({
        targets: mainMenuBtn,
        scaleX: 1,
        scaleY: 1,
        duration: 200,
        ease: "Power1",
      });
    });

    mainMenuBtn.on("pointerdown", () => {
      console.log("Main Menu button clicked! Returning to Main Menu...");
      this.scene.stop("GameOver");
      this.scene.start("MainMenu");
    });
  }
}

class GameComplete extends Phaser.Scene {
  constructor() {
    super({ key: "GameComplete" });
  }

  init(data) {
    // Data yang diterima dari scene sebelumnya
    this.finalScore = data.score || 0;
  }

  create() {
    const { width, height } = this.scale;

    // Background overlay
    const background = this.add.image(width / 2, height / 2, "menuBackground");
    background.setDisplaySize(width, height);

    // "Game Completed" text
    this.add
      .text(width / 2, height / 2 - 100, "Game Completed!", {
        fontFamily: "Tiny5",
        fontSize: "32px",
        fill: "#ffffff",
        align: "center",
        stroke: "#000000",
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    // Display final score
    this.add
      .text(
        width / 2,
        height / 2 - 20,
        `Your Final Score: ${this.finalScore}`,
        {
          fontFamily: "Tiny5",
          fontSize: "32px",
          fill: "#ffffff",
          align: "center",
          stroke: "#000000",
          strokeThickness: 4,
        }
      )
      .setOrigin(0.5);

    // Create a button to go back to the main menu
    const mainMenuButton = this.add
      .rectangle(width / 2, height / 2 + 100, 200, 50, 0x5d1a1a)
      .setInteractive({ useHandCursor: true })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 + 100, "Main Menu", {
        fontFamily: "Tiny5",
        fontSize: "24px",
        fill: "#ffffff",
        stroke: "000000",
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    // Event listener for main menu button
    mainMenuButton.on("pointerdown", () => {
      console.log("Main Menu button clicked! Returning to Main Menu...");
      this.scene.start("MainMenu");
    });

    // Optional: Add a hover effect for the button
    mainMenuButton.on("pointerover", () => {
      this.tweens.add({
        targets: mainMenuButton,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 200,
        ease: "Power1",
      });
    });

    mainMenuButton.on("pointerout", () => {
      this.tweens.add({
        targets: mainMenuButton,
        scaleX: 1,
        scaleY: 1,
        duration: 200,
        ease: "Power1",
      });
    });
  }
}

class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "MenuScene" });
  }

  create(data) {
    const { width, height } = this.scale;

    // Tambahkan latar belakang menu
    const menuBackground = this.add
      .rectangle(width / 2, height / 2, 300, 400, 0x006400)
      .setStrokeStyle(4, 0x5d1a1a)
      .setOrigin(0.5);

    // Tambahkan teks "PAUSE"
    this.add
      .text(width / 2, height / 2 - 150, "PAUSE", {
        fontFamily: "Tiny5",
        fontSize: "48px",
        fill: "#ffffff",
      })
      .setOrigin(0.5);

    // Tombol "Resume"
    const resumeButton = this.add

      .rectangle(width / 2, height / 2 - 60, 200, 50, 0x5d1a1a)
      .setInteractive({ useHandCursor: true })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 - 60, "RESUME", {
        fontFamily: "Tiny5",
        fontSize: "24px",
        fill: "#ffffff",
      })
      .setOrigin(0.5);

    resumeButton.on("pointerdown", () => {
      console.log("Resume clicked! Resuming the game...");
      this.scene.stop("MenuScene");
      this.scene.resume("Example"); // Melanjutkan game
    });

    // Tombol "Options"
    const optionsButton = this.add
      .rectangle(width / 2, height / 2, 200, 50, 0x5d1a1a)
      .setInteractive({ useHandCursor: true })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2, "OPTIONS", {
        fontFamily: "Tiny5",
        fontSize: "24px",
        fill: "#ffffff",
      })
      .setOrigin(0.5);

    optionsButton.on("pointerdown", () => {
      console.log("Options clicked! Opening options...");
      this.showOptions(data);
    });

    // Tombol "Exit"
    const exitButton = this.add
      .rectangle(width / 2, height / 2 + 60, 200, 50, 0x5d1a1a)
      .setInteractive({ useHandCursor: true })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 + 60, "EXIT", {
        fontFamily: "Tiny5",
        fontSize: "24px",
        fill: "#ffffff",
      })
      .setOrigin(0.5);

    exitButton.on("pointerdown", () => {
      console.log("Exit clicked! Returning to Main Menu...");

      // Hentikan semua musik yang diputar di sound manager
      if (this.sound) {
        this.sound.stopAll(); // Hentikan semua suara, termasuk musik
      }

      // Hentikan MenuScene dan Example Scene
      this.scene.stop("MenuScene");
      this.scene.stop("Example");

      // Kembali ke Main Menu
      this.scene.start("MainMenu");
    });

    // Hover effect for buttons
    [resumeButton, optionsButton, exitButton].forEach((button) => {
      button.on("pointerover", () => {
        this.tweens.add({
          targets: button,
          scaleX: 1.1,
          scaleY: 1.1,
          duration: 100,
          ease: "Power1",
        });
      });

      button.on("pointerout", () => {
        this.tweens.add({
          targets: button,
          scaleX: 1,
          scaleY: 1,
          duration: 100,
          ease: "Power1",
        });
      });
    });
  }

  showOptions(data) {
    const { width, height } = this.scale;

    // Clear the scene to display options
    this.children.removeAll();

    // Tambahkan latar belakang untuk opsi
    const optionsBackground = this.add
      .rectangle(width / 2, height / 2, 300, 300, 0x006400)
      .setStrokeStyle(4, 0x5d1a1a)
      .setOrigin(0.5);

    // Teks "OPTIONS"
    this.add
      .text(width / 2, height / 2 - 120, "OPTIONS", {
        fontFamily: "Tiny5",
        fontSize: "36px",
        fill: "#ffffff",
      })
      .setOrigin(0.5);

    // Label untuk volume musik
    this.add
      .text(width / 2 - 100, height / 2 - 30, "Music Volume:", {
        fontFamily: "Tiny5",
        fontSize: "20px",
        fill: "#ffffff",
      })
      .setOrigin(0);

    // Slider untuk volume musik
    const volumeSlider = this.add
      .rectangle(width / 2, height / 2, 200, 10, 0x888888)
      .setOrigin(0.5);

    // Tombol untuk mengatur posisi slider
    const sliderButton = this.add
      .circle(width / 2, height / 2, 10, 0x5d1a1a)
      .setInteractive({ draggable: true });

    // Teks volume untuk menampilkan angka
    const volumeText = this.add
      .text(width / 2 + 110, height / 2 - 40, "50", {
        fontFamily: "Tiny5",
        fontSize: "24px",
        fill: "#ffffff",
      })
      .setOrigin(0);

    // Atur nilai awal volume (default: 50)
    let currentVolume = 50;
    if (data.backgroundMusic) {
      currentVolume = Math.floor(data.backgroundMusic.volume * 100);
    }
    sliderButton.x = volumeSlider.x - 100 + currentVolume * 2;
    volumeText.setText(currentVolume);

    // Event untuk drag slider
    this.input.setDraggable(sliderButton);

    sliderButton.on("drag", (pointer, dragX) => {
      // Batasi pergerakan slider
      const minX = volumeSlider.x - 100;
      const maxX = volumeSlider.x + 100;

      if (dragX >= minX && dragX <= maxX) {
        sliderButton.x = dragX;

        // Hitung volume berdasarkan posisi slider
        const volume = Math.floor(((dragX - minX) / 200) * 100);
        currentVolume = volume;
        volumeText.setText(volume);

        // Atur volume musik
        if (data.backgroundMusic) {
          data.backgroundMusic.setVolume(volume / 100);
        }
      }
    });

    // Tombol "Back" untuk kembali ke menu utama
    const backButton = this.add
      .rectangle(width / 2, height / 2 + 120, 150, 50, 0x5d1a1a)
      .setInteractive({ useHandCursor: true })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 + 120, "BACK", {
        fontFamily: "Tiny5",
        fontSize: "24px",
        fill: "#ffffff",
      })
      .setOrigin(0.5);

    backButton.on("pointerdown", () => {
      console.log("Back to pause menu...");
      this.scene.restart(); // Kembali ke MenuScene
    });
  }
}

class LevelTransition extends Phaser.Scene {
  constructor() {
    super({ key: "LevelTransition" });
  }

  init(data) {
    // Terima data level dan skor
    this.level = data.level || 1;
    this.score = data.score || 0;
    console.log(
      `LevelTransition: Level = ${this.level}, Score = ${this.score}`
    );
  }

  create() {
    const { width, height } = this.scale;

    // Background overlay
    this.add.rectangle(0, 0, width, height, 0x000000, 0.7).setOrigin(0);

    // Level complete text
    this.add
      .text(width / 2, height / 2 - 100, `Level ${this.level} Complete!`, {
        fontFamily: "Tiny5",
        fontSize: "32px",
        fill: "#fff",
        align: "center",
        stroke: "#000000",
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    // Display score
    this.add
      .text(width / 2, height / 2, `Score: ${this.score}`, {
        fontFamily: "Tiny5",
        fontSize: "32px",
        fill: "#fff",
        stroke: "#00000",
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    // Continue button
    const continueBtn = this.add
      .rectangle(width / 2, height / 2 + 100, 270, 50, 0x006400)
      .setInteractive()
      .setOrigin(0.5);

    const btnText = this.add
      .text(
        width / 2,
        height / 2 + 100,
        "Continue to Level " + (this.level + 1),
        {
          fontFamily: "Tiny5",
          fontSize: "32px",
          fill: "#fff",
          stroke: "#00000",
          strokeThickness: 6,
        }
      )
      .setOrigin(0.5);

    // Hover effect with tween
    continueBtn.on("pointerover", () => {
      this.tweens.add({
        targets: continueBtn,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 200,
        ease: "Power1",
      });
    });

    continueBtn.on("pointerout", () => {
      this.tweens.add({
        targets: continueBtn,
        scaleX: 1,
        scaleY: 1,
        duration: 200,
        ease: "Power1",
      });
    });

    // Event listener for continue button
    continueBtn.on("pointerup", () => {
      console.log(`Continuing to Level ${this.level + 1} with reset score...`);
      this.scene.start("Example", {
        level: this.level + 1, // Mulai level berikutnya
        score: 0, // Reset skor ke 0 untuk level baru
      });
    });
  }
}

// Konfigurasi Phaser dengan menambahkan MainMenu sebagai scene pertama
const config = {
  type: Phaser.AUTO,
  parent: "renderDiv",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 360,
    height: 640,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 200 },
      debug: false,
    },
  },
  scene: [
    MainMenu,
    Example,
    MenuScene,
    LevelTransition,
    GameOver,
    GameComplete,
  ],
};

window.phaserGame = new Phaser.Game(config);

document.getElementById("fullscreenButton").addEventListener("click", () => {
  const gameInstance = window.phaserGame;
  if (gameInstance.scale.isFullscreen) {
    gameInstance.scale.stopFullscreen();
  } else {
    gameInstance.scale.startFullscreen();
  }
});

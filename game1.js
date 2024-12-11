class MainMenu extends Phaser.Scene {
  constructor() {
    super({ key: "MainMenu" });
    this.assetsLoaded = false;
  }

  preload() {
    console.log("MainMenu: Loading assets...");

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();

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

    // Load assets
    this.load.image("menuBackground", "assets/orchard.png");
    this.load.image("playButton", "assets/play_button.png");
    this.load.image("exitButton", "assets/Exit_button.png");
    this.load.image("text_title", "assets/main_menu_text.png");
    this.load.audio("background_music", "assets/back_sound.mp3");
  }

  create() {
    const { width, height } = this.scale;

    const background = this.add.image(width / 2, height / 2, "menuBackground");
    background.setDisplaySize(width, height);

    const titleText = this.add
      .image(width / 2, height / 2 - 200, "text_title")
      .setDisplaySize(300, 100);

    const playButton = this.add
      .image(width / 2, height / 2 - 50, "playButton")
      .setInteractive()
      .setDisplaySize(250, 100);
    playButton.on("pointerdown", () => {
      console.log("MainMenu: Starting Example scene (Level 1)");
      this.scene.start("Example", { level: 1 });
    });

    const devButton = this.add
      .image(width / 2, height / 2 + 50, "playButton")
      .setInteractive()
      .setDisplaySize(250, 100);
    this.add
      .text(width / 2, height / 2 + 50, "Dev Mode: Level 5", {
        fontSize: "24px",
        fill: "#000",
      })
      .setOrigin(0.5);
    devButton.on("pointerdown", () => {
      console.log("MainMenu: Starting Example scene (Dev Mode)");
      this.scene.start("Example", { level: 5, score: 1500 });
    });

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
  }

  init(data) {
    this.level = data.level || 1;
    this.score = data.score || 0;
    console.log(
      `Example initialized with Level: ${this.level}, Score: ${this.score}`
    );
  }

  preload() {
    this.load.image("anorganik_bin", "assets/anorganik.png");
    this.load.image("organik_bin", "assets/organik.png");
    this.load.image("b3_bin", "assets/B3.png");
    this.load.image("game_background", "assets/game_background.jpg");
    this.load.audio("background_music", "assets/music.mp3");
    this.load.image("anorganik1", "assets/anorganik1.png");
    this.load.image("organik1", "assets/organik1.png");
    this.load.image("b3_1", "assets/b3_1.png");
  }

  create() {
    const { width, height } = this.scale;

    const background = this.add
      .image(width / 2, height / 2, "game_background")
      .setDisplaySize(width, height);
    this.dustbins = {
      anorganik: this.add
        .image(width * 0.2, height - 50, "anorganik_bin")
        .setDisplaySize(100, 150),
      organik: this.add
        .image(width * 0.5, height - 50, "organik_bin")
        .setDisplaySize(100, 150),
      b3: this.add
        .image(width * 0.8, height - 50, "b3_bin")
        .setDisplaySize(100, 150),
    };

    this.scoreText = this.add.text(16, 16, `Score: ${this.score}`, {
      fontSize: "32px",
      fill: "#000",
    });
    this.timerText = this.add.text(16, 50, `Time: ${this.timeRemaining}`, {
      fontSize: "32px",
      fill: "#000",
    });

    this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.timeRemaining--;
        this.timerText.setText(`Time: ${this.timeRemaining}`);
        if (this.timeRemaining <= 0) {
          this.gameOver();
        }
      },
      loop: true,
    });

    this.addWasteItems();
  }

  addWasteItems() {
    const wasteItems = ["anorganik1", "organik1", "b3_1"];
    wasteItems.forEach((key, index) => {
      const waste = this.physics.add
        .image(Phaser.Math.Between(50, 300), -50, key)
        .setInteractive();
      waste.setVelocityY(150);
      waste.on("pointerdown", () => {
        console.log(`${key} clicked!`);
        this.score += 10;
        this.scoreText.setText(`Score: ${this.score}`);
        waste.destroy();
      });
    });
  }

  gameOver() {
    console.log("Game Over! Restarting Example scene...");
    this.scene.pause();
    const overlay = this.add
      .rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.7)
      .setOrigin(0)
      .setDepth(100);
    const gameOverText = this.add
      .text(this.scale.width / 2, this.scale.height / 2 - 100, "Game Over!", {
        fontSize: "32px",
        fill: "#fff",
      })
      .setOrigin(0.5)
      .setDepth(101);

    const restartBtn = this.add
      .rectangle(
        this.scale.width / 2,
        this.scale.height / 2 + 50,
        200,
        50,
        0x00ff00
      )
      .setInteractive()
      .setDepth(102);

    const restartText = this.add
      .text(this.scale.width / 2, this.scale.height / 2 + 50, "Restart", {
        fontSize: "24px",
        fill: "#000",
      })
      .setOrigin(0.5)
      .setDepth(103);

    restartBtn.on("pointerdown", () => {
      console.log("Restart button clicked! Restarting Example scene...");
      this.scene.start("Example", { level: 1, score: 0 });
    });
  }
}

class LevelTransition extends Phaser.Scene {
  constructor() {
    super({ key: "LevelTransition" });
  }

  init(data) {
    this.level = data.level || 1;
    this.score = data.score || 0;
  }

  create() {
    const { width, height } = this.scale;

    const overlay = this.add
      .rectangle(0, 0, width, height, 0x000000, 0.7)
      .setOrigin(0);

    this.add
      .text(width / 2, height / 2 - 100, `Level ${this.level} Complete!`, {
        fontSize: "32px",
        fill: "#fff",
        align: "center",
      })
      .setOrigin(0.5);

    const continueBtn = this.add
      .rectangle(width / 2, height / 2 + 100, 200, 50, 0x00ff00)
      .setInteractive();
    const btnText = this.add
      .text(width / 2, height / 2 + 100, "Continue", {
        fontSize: "24px",
        fill: "#000",
      })
      .setOrigin(0.5);

    continueBtn.on("pointerdown", () => {
      console.log(`Continuing to Level ${this.level + 1}`);
      this.scene.start("Example", { level: this.level + 1, score: 0 });
    });
  }
}

const config = {
  type: Phaser.AUTO,
  parent: "renderDiv",
  width: 360,
  height: 640,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 200 },
    },
  },
  scene: [MainMenu, Example, LevelTransition],
};

const game = new Phaser.Game(config);

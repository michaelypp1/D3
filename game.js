class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create() {
    this.cameras.main.setBackgroundColor("#0a0a12");

    this.add.text(400, 120, "NEON DELIVERY", {
      fontSize: "52px",
      color: "#00ffff"
    }).setOrigin(0.5);

    this.add.text(400, 230, "Its all about Physicse!", {
      fontSize: "24px",
      color: "#ffffff"
    }).setOrigin(0.5);

    this.add.text(400, 340,
      "WASD / Arrow Keys = Move\nSHIFT = Boost\nE = Grab / Launch\nR = Restart",
      {
        fontSize: "22px",
        align: "center",
        color: "#aaaaaa"
      }
    ).setOrigin(0.5);

    this.add.text(400, 510, "CLICK TO START", {
      fontSize: "30px",
      color: "#ff00ff"
    }).setOrigin(0.5);

    this.input.once("pointerdown", () => this.scene.start("Level1"));
    this.input.keyboard.once("keydown-SPACE", () => this.scene.start("Level1"));
  }
}

class SummaryScene extends Phaser.Scene {
  constructor() {
    super("SummaryScene");
  }

  init(data) {
    this.level = data.level;
    this.timeSpent = data.time;
    this.nextScene = data.next;
  }

  create() {
    this.cameras.main.setBackgroundColor("#111122");

    this.add.text(400, 170, `LEVEL ${this.level} COMPLETE`, {
      fontSize: "42px",
      color: "#00ff99"
    }).setOrigin(0.5);

    this.add.text(400, 280, `Time: ${this.timeSpent.toFixed(1)} seconds`, {
      fontSize: "28px",
      color: "#ffffff"
    }).setOrigin(0.5);

    this.add.text(400, 430, "CLICK TO CONTINUE", {
      fontSize: "26px",
      color: "#00ffff"
    }).setOrigin(0.5);

    this.input.once("pointerdown", () => this.scene.start(this.nextScene));
  }
}

class BaseLevel extends Phaser.Scene {
  constructor(key) {
    super(key);
  }

  createLevel(levelNumber) {
    this.levelFinished = false;
    this.levelNumber = levelNumber;
    this.isGrabbing = false;
    this.holdDirection = { x: 1, y: 0 };
    this.launchPower = 520;
    this.startTime = this.time.now;

    this.cameras.main.setBackgroundColor("#0f0f18");
    this.physics.world.setBounds(0, 0, 800, 600);

    this.add.text(20, 20, `Level ${levelNumber}`, {
      fontSize: "28px",
      color: "#ffffff"
    });

    this.statusText = this.add.text(20, 55, "E = Grab / Launch | SHIFT = Boost", {
      fontSize: "16px",
      color: "#aaaaaa"
    });

    this.aimLine = this.add.line(0, 0, 0, 0, 0, 0xff00ff, 0.9);
    this.aimLine.setVisible(false);
    this.aimLine.setLineWidth(4);

    this.player = this.add.rectangle(100, 300, 40, 40, 0x00ffff);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);
    this.player.body.setDrag(180);
    this.player.body.setMaxVelocity(420);

    this.core = this.add.circle(220, 300, 25, 0xff00ff);
    this.physics.add.existing(this.core);
    this.core.body.setBounce(0.25);
    this.core.body.setDrag(120);
    this.core.body.setCollideWorldBounds(true);

    this.goal = this.add.rectangle(735, 300, 50, 80, 0x00ff00, 0.35);
    this.physics.add.existing(this.goal, true);

    this.playerCoreCollider = this.physics.add.collider(this.player, this.core);

    this.physics.add.overlap(this.core, this.goal, () => {
      if (this.levelFinished) return;
      this.levelFinished = true;

      const elapsed = (this.time.now - this.startTime) / 1000;

      this.scene.start("SummaryScene", {
        level: this.levelNumber,
        time: elapsed,
        next: this.nextScene
      });
    });

    this.cursors = this.input.keyboard.createCursorKeys();

    this.keys = this.input.keyboard.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D,
      E: Phaser.Input.Keyboard.KeyCodes.E,
      SHIFT: Phaser.Input.Keyboard.KeyCodes.SHIFT,
      R: Phaser.Input.Keyboard.KeyCodes.R
    });
  }

  addWall(x, y, width, height, color = 0xff5555) {
    const wall = this.add.rectangle(x, y, width, height, color);
    this.physics.add.existing(wall);
    wall.body.setImmovable(true);

    this.physics.add.collider(this.player, wall);
    this.physics.add.collider(this.core, wall);

    return wall;
  }

  addDangerZone(x, y, width, height) {
    const danger = this.add.rectangle(x, y, width, height, 0xff0000, 0.25);
    this.physics.add.existing(danger, true);

    this.physics.add.overlap(this.core, danger, () => {
      if (!this.levelFinished && !this.isGrabbing) this.scene.restart();
    });

    this.physics.add.overlap(this.player, danger, () => {
      if (!this.levelFinished) this.scene.restart();
    });

    return danger;
  }

  updateAimDirection() {
    let dx = 0;
    let dy = 0;

    if (this.keys.A.isDown || this.cursors.left.isDown) dx -= 1;
    if (this.keys.D.isDown || this.cursors.right.isDown) dx += 1;
    if (this.keys.W.isDown || this.cursors.up.isDown) dy -= 1;
    if (this.keys.S.isDown || this.cursors.down.isDown) dy += 1;

    if (dx !== 0 || dy !== 0) {
      const len = Math.sqrt(dx * dx + dy * dy);
      this.holdDirection.x = dx / len;
      this.holdDirection.y = dy / len;
    }
  }

  update() {
    const speed = this.keys.SHIFT.isDown ? 430 : 260;

    if (this.keys.A.isDown || this.cursors.left.isDown) {
      this.player.body.setAccelerationX(-speed);
    } else if (this.keys.D.isDown || this.cursors.right.isDown) {
      this.player.body.setAccelerationX(speed);
    } else {
      this.player.body.setAccelerationX(0);
    }

    if (this.keys.W.isDown || this.cursors.up.isDown) {
      this.player.body.setAccelerationY(-speed);
    } else if (this.keys.S.isDown || this.cursors.down.isDown) {
      this.player.body.setAccelerationY(speed);
    } else {
      this.player.body.setAccelerationY(0);
    }

    this.updateAimDirection();

    if (Phaser.Input.Keyboard.JustDown(this.keys.E)) {
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        this.core.x,
        this.core.y
      );

      if (!this.isGrabbing && distance < 95) {
        this.isGrabbing = true;
      } else if (this.isGrabbing) {
        this.isGrabbing = false;
        this.core.body.setVelocity(
          this.holdDirection.x * this.launchPower + this.player.body.velocity.x * 0.45,
          this.holdDirection.y * this.launchPower + this.player.body.velocity.y * 0.45
        );
      }
    }

    if (this.isGrabbing) {
      this.playerCoreCollider.active = false;

      this.core.x = this.player.x + 45;
      this.core.y = this.player.y;
      this.core.body.setVelocity(0, 0);

      this.aimLine.setTo(
        this.core.x,
        this.core.y,
        this.core.x + this.holdDirection.x * 90,
        this.core.y + this.holdDirection.y * 90
      );
      this.aimLine.setVisible(true);

      this.statusText.setText("Holding Core | Press E to Launch");
      this.statusText.setColor("#00ff99");
    } else {
      this.playerCoreCollider.active = true;

      this.aimLine.setVisible(false);
      this.statusText.setText("E = Grab / Launch | SHIFT = Boost");
      this.statusText.setColor("#aaaaaa");
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.R)) {
      this.scene.restart();
    }
  }
}

class Level1 extends BaseLevel {
  constructor() {
    super("Level1");
  }

  create() {
    this.nextScene = "Level2";
    this.createLevel(1);

    this.addWall(330, 145, 30, 230);
    this.addWall(330, 455, 30, 230);
    this.addWall(500, 300, 30, 260);
    this.addWall(620, 160, 200, 25);
    this.addWall(620, 440, 200, 25);
  }
}

class Level2 extends BaseLevel {
  constructor() {
    super("Level2");
  }

  create() {
    this.nextScene = "Level3";
    this.createLevel(2);

    this.addWall(360, 120, 30, 180);
    this.addWall(360, 480, 30, 180);
    this.addWall(575, 300, 30, 220);

    this.addDangerZone(460, 300, 75, 95);
    this.addDangerZone(690, 110, 75, 50);
    this.addDangerZone(690, 490, 75, 50);

    this.movingWall1 = this.add.rectangle(250, 210, 130, 22, 0xffff00);
    this.physics.add.existing(this.movingWall1);
    this.movingWall1.body.setImmovable(true);
    this.movingWall1.body.setVelocityY(145);
    this.movingWall1.body.setBounce(1, 1);
    this.movingWall1.body.setCollideWorldBounds(true);

    this.movingWall2 = this.add.rectangle(610, 390, 130, 22, 0xffff00);
    this.physics.add.existing(this.movingWall2);
    this.movingWall2.body.setImmovable(true);
    this.movingWall2.body.setVelocityY(-145);
    this.movingWall2.body.setBounce(1, 1);
    this.movingWall2.body.setCollideWorldBounds(true);

    this.physics.add.collider(this.player, this.movingWall1);
    this.physics.add.collider(this.player, this.movingWall2);
    this.physics.add.collider(this.core, this.movingWall1);
    this.physics.add.collider(this.core, this.movingWall2);
  }
}

class Level3 extends BaseLevel {
  constructor() {
    super("Level3");
  }

  create() {
    this.nextScene = "EndScene";
    this.createLevel(3);

    this.launchPower = 620;

    this.goal.x = 735;
    this.goal.y = 300;

    this.addWall(280, 120, 25, 200);
    this.addWall(280, 480, 25, 200);

    this.addWall(470, 300, 25, 260);

    this.addWall(620, 120, 25, 200);
    this.addWall(620, 480, 25, 200);

    this.addDangerZone(380, 300, 60, 110);
    this.addDangerZone(540, 300, 60, 110);

    this.bouncer1 = this.add.rectangle(360, 120, 130, 20, 0x00ff99);
    this.physics.add.existing(this.bouncer1);
    this.bouncer1.body.setImmovable(true);

    this.bouncer2 = this.add.rectangle(555, 480, 130, 20, 0x00ff99);
    this.physics.add.existing(this.bouncer2);
    this.bouncer2.body.setImmovable(true);

    this.physics.add.collider(this.player, this.bouncer1);
    this.physics.add.collider(this.player, this.bouncer2);

    this.physics.add.collider(this.core, this.bouncer1, () => {
      this.core.body.setVelocity(360, 260);
    });

    this.physics.add.collider(this.core, this.bouncer2, () => {
      this.core.body.setVelocity(360, -260);
    });
  }
}

class EndScene extends Phaser.Scene {
  constructor() {
    super("EndScene");
  }

  create() {
    this.cameras.main.setBackgroundColor("#000000");

    this.add.text(400, 190, "COMPLETE", {
      fontSize: "48px",
      color: "#00ff99"
    }).setOrigin(0.5);

    this.add.text(400, 320, "You Finished", {
      fontSize: "28px",
      color: "#ffffff"
    }).setOrigin(0.5);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: "game",
  backgroundColor: "#05060a",
  physics: {
    default: "arcade",
    arcade: {
      debug: false
    }
  },
  scene: [
    MenuScene,
    SummaryScene,
    Level1,
    Level2,
    Level3,
    EndScene
  ]
};

new Phaser.Game(config);
let hasKeycard = false;
let discoveredCode = false;
let playerInput = "";

class StartScene extends Phaser.Scene {
  constructor() {
    super("StartScene");
  }

  create() {
    this.add.text(400, 120, "NEON ESCAPE", {
      fontSize: "52px",
      color: "#00ffff"
    }).setOrigin(0.5);

    this.add.text(400, 220, "A short cyberpunk puzzle prototype", {
      fontSize: "22px",
      color: "#ffffff"
    }).setOrigin(0.5);

    const start = this.add.text(400, 360, "CLICK TO START", {
      fontSize: "28px",
      color: "#ff00ff"
    }).setOrigin(0.5).setInteractive();

    start.on("pointerdown", () => {
      this.scene.start("RoomScene");
    });
  }
}

class RoomScene extends Phaser.Scene {
  constructor() {
    super("RoomScene");
  }

  create() {
    this.cameras.main.setBackgroundColor("#101020");

    this.add.text(400, 50, "Abandoned Control Room", {
      fontSize: "30px",
      color: "#00ffff"
    }).setOrigin(0.5);

    this.add.text(400, 100, "You wake up inside a locked room. The city outside is silent.", {
      fontSize: "18px",
      color: "#ffffff"
    }).setOrigin(0.5);

    const wall = this.add.rectangle(400, 250, 500, 180, 0x222244);
    wall.setStrokeStyle(3, 0x00ffff);

    const clueText = this.add.text(400, 250, "Click the wall to inspect the strange symbols", {
      fontSize: "18px",
      color: "#cccccc"
    }).setOrigin(0.5);

    wall.setInteractive();
    wall.on("pointerdown", () => {
      discoveredCode = true;
      clueText.setText("▲ ● ■ ◆ = 3142");
      clueText.setColor("#ffff00");
    });

    const keycard = this.add.text(180, 480, "[ Pick up Keycard ]", {
      fontSize: "22px",
      color: "#00ff99"
    }).setInteractive();

    keycard.on("pointerdown", () => {
      hasKeycard = true;
      keycard.setText("Keycard collected");
      keycard.setColor("#777777");
    });

    const door = this.add.text(590, 480, "[ Go to Door ]", {
      fontSize: "22px",
      color: "#ff5555"
    }).setInteractive();

    door.on("pointerdown", () => {
      this.scene.start("DoorScene");
    });

    this.time.delayedCall(12000, () => {
      this.add.text(400, 560, "Hint: the wall is not just decoration.", {
        fontSize: "18px",
        color: "#ffaa00"
      }).setOrigin(0.5);
    });
  }
}

class DoorScene extends Phaser.Scene {
  constructor() {
    super("DoorScene");
  }

  create() {
    this.cameras.main.setBackgroundColor("#080814");

    this.add.text(400, 60, "Security Door", {
      fontSize: "32px",
      color: "#ff00ff"
    }).setOrigin(0.5);

    const status = this.add.text(400, 130, "Enter the 4-digit code.", {
      fontSize: "22px",
      color: "#ffffff"
    }).setOrigin(0.5);

    const inputDisplay = this.add.text(400, 210, "____", {
      fontSize: "48px",
      color: "#00ffff"
    }).setOrigin(0.5);

    const numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

    numbers.forEach((num, index) => {
      const x = 250 + (index % 5) * 75;
      const y = 310 + Math.floor(index / 5) * 75;

      const button = this.add.text(x, y, num, {
        fontSize: "32px",
        color: "#ffffff",
        backgroundColor: "#333355",
        padding: { x: 18, y: 10 }
      }).setOrigin(0.5).setInteractive();

      button.on("pointerdown", () => {
        if (playerInput.length < 4) {
          playerInput += num;
          inputDisplay.setText(playerInput.padEnd(4, "_"));
        }
      });
    });

    const clear = this.add.text(280, 500, "CLEAR", {
      fontSize: "22px",
      color: "#ffaa00"
    }).setInteractive();

    clear.on("pointerdown", () => {
      playerInput = "";
      inputDisplay.setText("____");
    });

    const enter = this.add.text(500, 500, "ENTER", {
      fontSize: "22px",
      color: "#00ff99"
    }).setInteractive();

    enter.on("pointerdown", () => {
      if (!hasKeycard) {
        status.setText("ACCESS DENIED: keycard required.");
        status.setColor("#ff5555");
        return;
      }

      if (!discoveredCode) {
        status.setText("You do not understand the symbols yet.");
        status.setColor("#ffaa00");
        return;
      }

      if (playerInput === "3142") {
        this.scene.start("EndingScene");
      } else {
        status.setText("Wrong code. Check the wall symbols again.");
        status.setColor("#ff5555");
        playerInput = "";
        inputDisplay.setText("____");
      }
    });

    const back = this.add.text(400, 570, "Go back to the room", {
      fontSize: "18px",
      color: "#aaaaaa"
    }).setOrigin(0.5).setInteractive();

    back.on("pointerdown", () => {
      this.scene.start("RoomScene");
    });
  }
}

class EndingScene extends Phaser.Scene {
  constructor() {
    super("EndingScene");
  }

  create() {
    this.cameras.main.setBackgroundColor("#000000");

    this.add.text(400, 180, "ACCESS GRANTED", {
      fontSize: "44px",
      color: "#00ff99"
    }).setOrigin(0.5);

    this.add.text(400, 280, "You escape the room, but the city outside is still watching.", {
      fontSize: "22px",
      color: "#ffffff",
      align: "center"
    }).setOrigin(0.5);

    this.add.text(400, 380, "Prototype End", {
      fontSize: "26px",
      color: "#00ffff"
    }).setOrigin(0.5);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: "game",
  scene: [StartScene, RoomScene, DoorScene, EndingScene]
};

const game = new Phaser.Game(config);
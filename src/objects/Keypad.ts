import Phaser from 'phaser';

export interface KeypadConfig {
  values: number[];
  onValueSelected: (value: number) => void;
}

export class Keypad extends Phaser.GameObjects.Container {
  private buttons: Phaser.GameObjects.Container[] = [];
  private sumDisplay: Phaser.GameObjects.Text;
  private sumBackground: Phaser.GameObjects.Graphics;
  private currentSum: number = 0;
  private selectionCount: number = 0;
  private readonly MAX_SELECTIONS = 4;
  private onValueSelected: (value: number) => void;

  constructor(scene: Phaser.Scene, x: number, y: number, config: KeypadConfig) {
    super(scene, x, y);

    this.onValueSelected = config.onValueSelected;

    const width = scene.cameras.main.width;
    const buttonSize = Math.min(65, (width - 100) / 5);
    const padding = 8;
    const buttonsPerRow = 4;

    // Create sum display background
    this.sumBackground = scene.add.graphics();
    this.sumBackground.fillStyle(0x222233, 1);
    this.sumBackground.fillRoundedRect(-width / 2 + 20, -130, width - 40, 45, 10);
    this.add(this.sumBackground);

    // Create sum display text
    this.sumDisplay = scene.add.text(0, -107, 'Sum: 0', {
      fontSize: '28px',
      color: '#00ff88',
      fontStyle: 'bold',
    });
    this.sumDisplay.setOrigin(0.5);
    this.add(this.sumDisplay);

    // Calculate grid layout - account for clear button in centering
    const clearButtonWidth = 45;
    const clearButtonPadding = 10;
    const totalButtonWidth = buttonsPerRow * buttonSize + (buttonsPerRow - 1) * padding;
    const totalWidth = totalButtonWidth + clearButtonPadding + clearButtonWidth;
    const startX = -totalWidth / 2 + buttonSize / 2;

    // Create buttons
    config.values.forEach((value, index) => {
      const row = Math.floor(index / buttonsPerRow);
      const col = index % buttonsPerRow;

      const btnX = startX + col * (buttonSize + padding);
      const btnY = row * (buttonSize + padding);

      const button = this.createButton(scene, btnX, btnY, buttonSize, value);
      this.buttons.push(button);
      this.add(button);
    });

    // Create clear button
    const clearButton = this.createClearButton(
      scene,
      startX + totalButtonWidth + clearButtonPadding + clearButtonWidth / 2 - buttonSize / 2,
      (buttonSize + padding) / 2,
      clearButtonWidth,
      buttonSize * 2 + padding
    );
    this.add(clearButton);

    scene.add.existing(this);
  }

  private createButton(
    scene: Phaser.Scene,
    x: number,
    y: number,
    size: number,
    value: number
  ): Phaser.GameObjects.Container {
    const container = scene.add.container(x, y);

    // Button background
    const bg = scene.add.graphics();
    bg.fillStyle(0x4488ff, 1);
    bg.fillRoundedRect(-size / 2, -size / 2, size, size, 12);
    container.add(bg);

    // Button text
    const text = scene.add.text(0, 0, value.toString(), {
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    text.setOrigin(0.5);
    container.add(text);

    // Interactive hit area
    const hitArea = scene.add.rectangle(0, 0, size, size);
    hitArea.setInteractive({ useHandCursor: true });
    container.add(hitArea);

    // Button events
    hitArea.on('pointerdown', () => {
      bg.clear();
      bg.fillStyle(0x66aaff, 1);
      bg.fillRoundedRect(-size / 2, -size / 2, size, size, 12);
      
      // Scale animation
      scene.tweens.add({
        targets: container,
        scaleX: 0.9,
        scaleY: 0.9,
        duration: 50,
      });
    });

    hitArea.on('pointerup', () => {
      bg.clear();
      bg.fillStyle(0x4488ff, 1);
      bg.fillRoundedRect(-size / 2, -size / 2, size, size, 12);

      scene.tweens.add({
        targets: container,
        scaleX: 1,
        scaleY: 1,
        duration: 50,
      });

      this.addToSum(value);
    });

    hitArea.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x4488ff, 1);
      bg.fillRoundedRect(-size / 2, -size / 2, size, size, 12);

      scene.tweens.add({
        targets: container,
        scaleX: 1,
        scaleY: 1,
        duration: 50,
      });
    });

    return container;
  }

  private createClearButton(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number
  ): Phaser.GameObjects.Container {
    const container = scene.add.container(x, y);

    const bg = scene.add.graphics();
    bg.fillStyle(0xff6666, 1);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 12);
    container.add(bg);

    const text = scene.add.text(0, 0, 'C', {
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    text.setOrigin(0.5);
    container.add(text);

    const hitArea = scene.add.rectangle(0, 0, width, height);
    hitArea.setInteractive({ useHandCursor: true });
    container.add(hitArea);

    hitArea.on('pointerdown', () => {
      bg.clear();
      bg.fillStyle(0xff8888, 1);
      bg.fillRoundedRect(-width / 2, -height / 2, width, height, 12);
    });

    hitArea.on('pointerup', () => {
      bg.clear();
      bg.fillStyle(0xff6666, 1);
      bg.fillRoundedRect(-width / 2, -height / 2, width, height, 12);
      this.resetSum();
    });

    hitArea.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0xff6666, 1);
      bg.fillRoundedRect(-width / 2, -height / 2, width, height, 12);
    });

    return container;
  }

  private addToSum(value: number): void {
    // Check if max selections reached
    if (this.selectionCount >= this.MAX_SELECTIONS) {
      this.flashMaxReached();
      return;
    }

    this.currentSum += value;
    this.selectionCount++;
    this.updateSumDisplay();
    this.onValueSelected(value);
  }

  public resetSum(): void {
    this.currentSum = 0;
    this.selectionCount = 0;
    this.updateSumDisplay();
  }

  public getCurrentSum(): number {
    return this.currentSum;
  }

  private updateSumDisplay(): void {
    this.sumDisplay.setText(`Sum: ${this.currentSum} (${this.selectionCount}/${this.MAX_SELECTIONS})`);
  }

  private flashMaxReached(): void {
    // Flash orange to indicate max reached
    this.sumDisplay.setColor('#ffaa00');
    this.sumBackground.clear();
    this.sumBackground.fillStyle(0x443322, 1);
    this.sumBackground.fillRoundedRect(
      -this.scene.cameras.main.width / 2 + 20,
      -130,
      this.scene.cameras.main.width - 40,
      45,
      10
    );

    this.scene.cameras.main.shake(50, 0.005);

    this.scene.time.delayedCall(200, () => {
      this.sumDisplay.setColor('#00ff88');
      this.sumBackground.clear();
      this.sumBackground.fillStyle(0x222233, 1);
      this.sumBackground.fillRoundedRect(
        -this.scene.cameras.main.width / 2 + 20,
        -130,
        this.scene.cameras.main.width - 40,
        45,
        10
      );
    });
  }

  public flashError(): void {
    // Flash the sum display red
    this.sumDisplay.setColor('#ff4444');
    this.sumBackground.clear();
    this.sumBackground.fillStyle(0x442222, 1);
    this.sumBackground.fillRoundedRect(
      -this.scene.cameras.main.width / 2 + 20,
      -130,
      this.scene.cameras.main.width - 40,
      45,
      10
    );

    this.scene.time.delayedCall(200, () => {
      this.sumDisplay.setColor('#00ff88');
      this.sumBackground.clear();
      this.sumBackground.fillStyle(0x222233, 1);
      this.sumBackground.fillRoundedRect(
        -this.scene.cameras.main.width / 2 + 20,
        -130,
        this.scene.cameras.main.width - 40,
        45,
        10
      );
    });
  }

  public flashSuccess(): void {
    // Flash the sum display bright green
    this.sumDisplay.setColor('#ffffff');
    this.sumBackground.clear();
    this.sumBackground.fillStyle(0x224422, 1);
    this.sumBackground.fillRoundedRect(
      -this.scene.cameras.main.width / 2 + 20,
      -130,
      this.scene.cameras.main.width - 40,
      45,
      10
    );

    this.scene.time.delayedCall(200, () => {
      this.sumDisplay.setColor('#00ff88');
      this.sumBackground.clear();
      this.sumBackground.fillStyle(0x222233, 1);
      this.sumBackground.fillRoundedRect(
        -this.scene.cameras.main.width / 2 + 20,
        -130,
        this.scene.cameras.main.width - 40,
        45,
        10
      );
    });
  }
}

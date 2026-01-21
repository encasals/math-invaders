import Phaser from 'phaser';

export class MainMenu extends Phaser.Scene {
  constructor() {
    super('MainMenu');
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Title
    const title = this.add.text(width / 2, height / 4, 'MATH\nINVADERS', {
      fontSize: '64px',
      color: '#00ff88',
      fontStyle: 'bold',
      align: 'center',
    });
    title.setOrigin(0.5);

    // Subtitle
    const subtitle = this.add.text(width / 2, height / 4 + 120, 'Sum to Destroy!', {
      fontSize: '24px',
      color: '#ffffff',
    });
    subtitle.setOrigin(0.5);

    // Instructions
    const instructions = this.add.text(width / 2, height / 2, 
      'Tap numbers to add them up.\n\nMatch the falling number\'s\nvalue to destroy it!\n\nDon\'t let them reach the bottom!', {
      fontSize: '18px',
      color: '#aaaaaa',
      align: 'center',
      lineSpacing: 8,
    });
    instructions.setOrigin(0.5);

    // Start button
    const startButton = this.add.graphics();
    startButton.fillStyle(0x00ff88, 1);
    startButton.fillRoundedRect(width / 2 - 100, height * 0.7, 200, 60, 15);

    const startText = this.add.text(width / 2, height * 0.7 + 30, 'START', {
      fontSize: '32px',
      color: '#000000',
      fontStyle: 'bold',
    });
    startText.setOrigin(0.5);

    // Make button interactive
    const hitArea = this.add.rectangle(width / 2, height * 0.7 + 30, 200, 60);
    hitArea.setInteractive({ useHandCursor: true });

    hitArea.on('pointerdown', () => {
      startButton.clear();
      startButton.fillStyle(0x00cc66, 1);
      startButton.fillRoundedRect(width / 2 - 100, height * 0.7, 200, 60, 15);
    });

    hitArea.on('pointerup', () => {
      this.scene.start('Game');
    });

    hitArea.on('pointerout', () => {
      startButton.clear();
      startButton.fillStyle(0x00ff88, 1);
      startButton.fillRoundedRect(width / 2 - 100, height * 0.7, 200, 60, 15);
    });

    // High score display
    const highScore = localStorage.getItem('mathInvadersHighScore') || '0';
    const highScoreText = this.add.text(width / 2, height * 0.85, `High Score: ${highScore}`, {
      fontSize: '20px',
      color: '#ffaa00',
    });
    highScoreText.setOrigin(0.5);
  }
}

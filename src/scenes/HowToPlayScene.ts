import Phaser from 'phaser';

export class HowToPlayScene extends Phaser.Scene {
  constructor() {
    super('HowToPlayScene');
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);

    // Title
    const title = this.add.text(width / 2, height * 0.15, 'HOW TO PLAY', {
      fontSize: `${Math.min(36, width * 0.09)}px`,
      color: '#00ff88',
      fontStyle: 'bold',
      align: 'center',
    });
    title.setOrigin(0.5);

    // Instructions panel background
    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x2a2a3e, 0.95);
    panelBg.lineStyle(3, 0x00ff88);
    panelBg.fillRoundedRect(width * 0.1, height * 0.25, width * 0.8, height * 0.5, 15);
    panelBg.strokeRoundedRect(width * 0.1, height * 0.25, width * 0.8, height * 0.5, 15);

    // Instructions text
    const instructionsText = `🎯 OBJECTIVE
Destroy falling numbers before they reach the bottom!

🧮 HOW TO PLAY
• Tap keypad numbers to build your sum
• When your sum matches a falling number, it gets destroyed
• Each destroyed number awards points
• Miss a number and lose a life

⚡ SCORING
• Larger numbers = More points
• Destroy multiple numbers quickly for bonus points
• Try to beat your high score!

💡 TIP
Plan your moves! Sometimes it's better to wait for the right number than to waste your sum.`;

    const instructions = this.add.text(width / 2, height * 0.5, instructionsText, {
      fontSize: '14px',
      color: '#ffffff',
      align: 'left',
      lineSpacing: 8,
      wordWrap: { width: width * 0.7 }
    });
    instructions.setOrigin(0.5);

    // Back button
    const backButton = this.add.graphics();
    backButton.fillStyle(0x444444, 1);
    backButton.fillRoundedRect(width / 2 - 60, height * 0.85, 120, 50, 10);

    const backText = this.add.text(width / 2, height * 0.85 + 25, 'BACK', {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    backText.setOrigin(0.5);

    // Make back button interactive
    const hitArea = this.add.rectangle(width / 2, height * 0.85 + 25, 120, 50);
    hitArea.setInteractive({ useHandCursor: true });

    hitArea.on('pointerdown', () => {
      backButton.clear();
      backButton.fillStyle(0x333333, 1);
      backButton.fillRoundedRect(width / 2 - 60, height * 0.85, 120, 50, 10);
    });

    hitArea.on('pointerup', () => {
      this.scene.start('MainMenu');
    });

    hitArea.on('pointerout', () => {
      backButton.clear();
      backButton.fillStyle(0x444444, 1);
      backButton.fillRoundedRect(width / 2 - 60, height * 0.85, 120, 50, 10);
    });
  }
}
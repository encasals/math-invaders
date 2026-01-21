import Phaser from 'phaser';

export class GameOver extends Phaser.Scene {
  private finalScore: number = 0;

  constructor() {
    super('GameOver');
  }

  init(data: { score: number }): void {
    this.finalScore = data.score || 0;
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Game Over title
    const gameOverText = this.add.text(width / 2, height / 4, 'GAME OVER', {
      fontSize: '48px',
      color: '#ff4444',
      fontStyle: 'bold',
    });
    gameOverText.setOrigin(0.5);

    // Score display
    const scoreText = this.add.text(width / 2, height / 2 - 50, `Score: ${this.finalScore}`, {
      fontSize: '36px',
      color: '#ffffff',
    });
    scoreText.setOrigin(0.5);

    // Check and update high score
    const currentHighScore = parseInt(localStorage.getItem('mathInvadersHighScore') || '0');
    let isNewHighScore = false;

    if (this.finalScore > currentHighScore) {
      localStorage.setItem('mathInvadersHighScore', this.finalScore.toString());
      isNewHighScore = true;
    }

    if (isNewHighScore) {
      const newHighScoreText = this.add.text(width / 2, height / 2, '🎉 NEW HIGH SCORE! 🎉', {
        fontSize: '24px',
        color: '#ffaa00',
      });
      newHighScoreText.setOrigin(0.5);

      // Animate the text
      this.tweens.add({
        targets: newHighScoreText,
        scale: { from: 1, to: 1.2 },
        duration: 500,
        yoyo: true,
        repeat: -1,
      });
    } else {
      const highScoreText = this.add.text(width / 2, height / 2, `High Score: ${currentHighScore}`, {
        fontSize: '24px',
        color: '#aaaaaa',
      });
      highScoreText.setOrigin(0.5);
    }

    // Restart button
    const restartButton = this.add.graphics();
    restartButton.fillStyle(0x00ff88, 1);
    restartButton.fillRoundedRect(width / 2 - 100, height * 0.65, 200, 60, 15);

    const restartText = this.add.text(width / 2, height * 0.65 + 30, 'PLAY AGAIN', {
      fontSize: '28px',
      color: '#000000',
      fontStyle: 'bold',
    });
    restartText.setOrigin(0.5);

    const restartHitArea = this.add.rectangle(width / 2, height * 0.65 + 30, 200, 60);
    restartHitArea.setInteractive({ useHandCursor: true });

    restartHitArea.on('pointerdown', () => {
      restartButton.clear();
      restartButton.fillStyle(0x00cc66, 1);
      restartButton.fillRoundedRect(width / 2 - 100, height * 0.65, 200, 60, 15);
    });

    restartHitArea.on('pointerup', () => {
      this.scene.start('Game');
    });

    // Menu button
    const menuButton = this.add.graphics();
    menuButton.fillStyle(0x4488ff, 1);
    menuButton.fillRoundedRect(width / 2 - 100, height * 0.78, 200, 60, 15);

    const menuText = this.add.text(width / 2, height * 0.78 + 30, 'MAIN MENU', {
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    menuText.setOrigin(0.5);

    const menuHitArea = this.add.rectangle(width / 2, height * 0.78 + 30, 200, 60);
    menuHitArea.setInteractive({ useHandCursor: true });

    menuHitArea.on('pointerdown', () => {
      menuButton.clear();
      menuButton.fillStyle(0x3366cc, 1);
      menuButton.fillRoundedRect(width / 2 - 100, height * 0.78, 200, 60, 15);
    });

    menuHitArea.on('pointerup', () => {
      this.scene.start('MainMenu');
    });
  }
}

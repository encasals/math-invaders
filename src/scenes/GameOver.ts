import Phaser from 'phaser';

export class GameOver extends Phaser.Scene {
  private finalScore: number = 0;
  private isNewRecord: boolean = false;
  private previousScore: number = 0;

  constructor() {
    super('GameOver');
  }

  init(data: { score: number; isNewRecord?: boolean; previousScore?: number }): void {
    this.finalScore = data.score || 0;
    this.isNewRecord = data.isNewRecord || false;
    this.previousScore = data.previousScore || 0;
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

    // Show record information
    if (this.isNewRecord) {
      const newRecordText = this.add.text(width / 2, height / 2, '🎉 NEW HIGH SCORE! 🎉', {
        fontSize: '24px',
        color: '#ffaa00',
        fontStyle: 'bold',
      });
      newRecordText.setOrigin(0.5);

      // Show improvement
      if (this.previousScore > 0) {
        const improvementText = this.add.text(width / 2, height / 2 + 30, `Previous best: ${this.previousScore}`, {
          fontSize: '16px',
          color: '#aaaaaa',
        });
        improvementText.setOrigin(0.5);

        const improvement = this.finalScore - this.previousScore;
        const improvementAmountText = this.add.text(width / 2, height / 2 + 50, `Improved by: +${improvement}`, {
          fontSize: '16px',
          color: '#00ff88',
        });
        improvementAmountText.setOrigin(0.5);
      }

      // Animate the new record text
      this.tweens.add({
        targets: newRecordText,
        scale: { from: 1, to: 1.1 },
        duration: 500,
        ease: 'Power2',
        yoyo: true,
        repeat: -1,
      });
    } else {
      // Show current high score for context
      const currentHighScore = Math.max(this.finalScore, this.previousScore);
      const highScoreText = this.add.text(width / 2, height / 2 + 10, `High Score: ${currentHighScore}`, {
        fontSize: '20px',
        color: '#ffaa00',
      });
      highScoreText.setOrigin(0.5);
    }

    // Restart button
    const restartButton = this.add.graphics();
    restartButton.fillStyle(0x00ff88, 1);
    restartButton.fillRoundedRect(width / 2 - 90, height * 0.65, 180, 50, 12);

    const restartText = this.add.text(width / 2, height * 0.65 + 25, 'PLAY AGAIN', {
      fontSize: '24px',
      color: '#000000',
      fontStyle: 'bold',
    });
    restartText.setOrigin(0.5);

    const restartHitArea = this.add.rectangle(width / 2, height * 0.65 + 25, 180, 50);
    restartHitArea.setInteractive({ useHandCursor: true });

    restartHitArea.on('pointerdown', () => {
      restartButton.clear();
      restartButton.fillStyle(0x00cc66, 1);
      restartButton.fillRoundedRect(width / 2 - 90, height * 0.65, 180, 50, 12);
    });

    restartHitArea.on('pointerup', () => {
      this.scene.start('Game');
    });

    // Menu button
    const menuButton = this.add.graphics();
    menuButton.fillStyle(0x4488ff, 1);
    menuButton.fillRoundedRect(width / 2 - 90, height * 0.75, 180, 50, 12);

    const menuText = this.add.text(width / 2, height * 0.75 + 25, 'MAIN MENU', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    menuText.setOrigin(0.5);

    const menuHitArea = this.add.rectangle(width / 2, height * 0.75 + 25, 180, 50);
    menuHitArea.setInteractive({ useHandCursor: true });

    menuHitArea.on('pointerdown', () => {
      menuButton.clear();
      menuButton.fillStyle(0x3366cc, 1);
      menuButton.fillRoundedRect(width / 2 - 90, height * 0.75, 180, 50, 12);
    });

    menuHitArea.on('pointerup', () => {
      this.scene.start('MainMenu', { refreshScores: this.isNewRecord });
    });

    // Share button
    const shareButton = this.add.graphics();
    shareButton.fillStyle(0xffcc00, 1);
    shareButton.fillRoundedRect(width / 2 - 90, height * 0.85, 180, 50, 12);

    const shareText = this.add.text(width / 2, height * 0.85 + 25, 'SHARE SCORE', {
      fontSize: '24px',
      color: '#000000',
      fontStyle: 'bold',
    });
    shareText.setOrigin(0.5);

    const shareHitArea = this.add.rectangle(width / 2, height * 0.85 + 25, 180, 50);
    shareHitArea.setInteractive({ useHandCursor: true });

    shareHitArea.on('pointerdown', () => {
      shareButton.clear();
      shareButton.fillStyle(0xcc9900, 1);
      shareButton.fillRoundedRect(width / 2 - 90, height * 0.85, 180, 50, 12);
    });

    shareHitArea.on('pointerup', () => {
      this.shareScore();
    });

    // Adjust for safe area on Android devices with on-screen navigation buttons
    const safeAreaPadding = 50; // Adjust this value as needed

    // Adjust positions of buttons to account for safe area
    restartButton.clear();
    restartButton.fillStyle(0x00ff88, 1);
    restartButton.fillRoundedRect(width / 2 - 90, height * 0.65 - safeAreaPadding, 180, 50, 12);
    restartText.setY(height * 0.65 + 25 - safeAreaPadding);
    restartHitArea.setY(height * 0.65 + 25 - safeAreaPadding);

    menuButton.clear();
    menuButton.fillStyle(0x4488ff, 1);
    menuButton.fillRoundedRect(width / 2 - 90, height * 0.75 - safeAreaPadding, 180, 50, 12);
    menuText.setY(height * 0.75 + 25 - safeAreaPadding);
    menuHitArea.setY(height * 0.75 + 25 - safeAreaPadding);

    shareButton.clear();
    shareButton.fillStyle(0xffcc00, 1);
    shareButton.fillRoundedRect(width / 2 - 90, height * 0.85 - safeAreaPadding, 180, 50, 12);
    shareText.setY(height * 0.85 + 25 - safeAreaPadding);
    shareHitArea.setY(height * 0.85 + 25 - safeAreaPadding);
  }

  private shareScore(): void {
    // Uses emojis for visual hierarchy
    const shareTitle = `🏆 New High Score in Math-Invaders!`;
    const shareText = `🚀 I just hit ${this.finalScore} points in Math-Invaders! \n\n👾 Can you beat my high score? \n\nPlay here 👇`;

    // Example: Using the Web Share API if available
    if (navigator.share) {
      navigator.share({
        title: shareTitle,
        text: shareText,
        url: window.location.href, // Share the current URL
      })
      .then(() => console.log('Share successful'))
      .catch(error => console.error('Error sharing:', error));
    } else {
      navigator.clipboard.writeText(shareText)
        .then(() => {
          console.log('Score copied to clipboard!');
          alert('Score copied to clipboard! Share it on your favorite platform.');
        })
        .catch(error => console.error('Error copying text:', error));
    }
  }
}

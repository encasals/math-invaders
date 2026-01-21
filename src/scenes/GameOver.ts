import Phaser from 'phaser';
import { AuthService } from '../firebase/authService';

export class GameOver extends Phaser.Scene {
  private authService: AuthService;
  private finalScore: number = 0;
  private isNewRecord: boolean = false;
  private previousScore: number = 0;
  private topScores: Array<{ username: string; displayName: string; highScore: number; rank: number }> = [];
  private scoresLoaded: boolean = false;
  private isLoadingScores: boolean = false;

  constructor() {
    super('GameOver');
    this.authService = AuthService.getInstance();
  }

  init(data: { score: number; isNewRecord?: boolean; previousScore?: number }): void {
    this.finalScore = data.score || 0;
    this.isNewRecord = data.isNewRecord || false;
    this.previousScore = data.previousScore || 0;
    
    // Only load scores if not already loaded or loading
    if (!this.scoresLoaded && !this.isLoadingScores) {
      this.loadTopScores();
    }
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

    // Display leaderboard (will be updated when scores load)
    this.updateLeaderboardDisplay();

    // Restart button
    const restartButton = this.add.graphics();
    restartButton.fillStyle(0x00ff88, 1);
    restartButton.fillRoundedRect(width / 2 - 250, height * 0.65, 180, 50, 12);

    const restartText = this.add.text(width / 2 - 160, height * 0.65 + 25, 'PLAY AGAIN', {
      fontSize: '24px',
      color: '#000000',
      fontStyle: 'bold',
    });
    restartText.setOrigin(0.5);

    const restartHitArea = this.add.rectangle(width / 2 - 160, height * 0.65 + 25, 180, 50);
    restartHitArea.setInteractive({ useHandCursor: true });

    restartHitArea.on('pointerdown', () => {
      restartButton.clear();
      restartButton.fillStyle(0x00cc66, 1);
      restartButton.fillRoundedRect(width / 2 - 250, height * 0.65, 180, 50, 12);
    });

    restartHitArea.on('pointerup', () => {
      this.scene.start('Game');
    });

    // Menu button
    const menuButton = this.add.graphics();
    menuButton.fillStyle(0x4488ff, 1);
    menuButton.fillRoundedRect(width / 2 - 250, height * 0.75, 180, 50, 12);

    const menuText = this.add.text(width / 2 - 160, height * 0.75 + 25, 'MAIN MENU', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    menuText.setOrigin(0.5);

    const menuHitArea = this.add.rectangle(width / 2 - 160, height * 0.75 + 25, 180, 50);
    menuHitArea.setInteractive({ useHandCursor: true });

    menuHitArea.on('pointerdown', () => {
      menuButton.clear();
      menuButton.fillStyle(0x3366cc, 1);
      menuButton.fillRoundedRect(width / 2 - 250, height * 0.75, 180, 50, 12);
    });

    menuHitArea.on('pointerup', () => {
      this.scene.start('MainMenu');
    });
  }

  private async loadTopScores(): Promise<void> {
    if (this.isLoadingScores || this.scoresLoaded) {
      return; // Avoid multiple simultaneous calls
    }

    this.isLoadingScores = true;
    
    try {
      // Force refresh if this is a new record to show updated rankings
      const forceRefresh = this.isNewRecord;
      this.topScores = await this.authService.getTopScores(forceRefresh);
      this.scoresLoaded = true;
      console.log('Top scores loaded successfully');
      
      // Update leaderboard display if scene is already created
      if (this.scene.isActive()) {
        this.updateLeaderboardDisplay();
      }
    } catch (error) {
      console.error('Error loading top scores:', error);
      this.topScores = [];
    } finally {
      this.isLoadingScores = false;
    }
  }

  private createLeaderboard(width: number): void {
    // Leaderboard title
    const leaderboardTitle = this.add.text(width - 20, 50, 'TOP 10', {
      fontSize: '24px',
      color: '#00ff88',
      fontStyle: 'bold',
    });
    leaderboardTitle.setOrigin(1, 0);
    (leaderboardTitle as any).isLeaderboardElement = true;

    // Leaderboard background
    const leaderboardBg = this.add.graphics();
    leaderboardBg.fillStyle(0x1a1a2e, 0.8);
    leaderboardBg.fillRoundedRect(width - 320, 80, 300, Math.min(this.topScores.length * 35 + 20, 360), 10);
    (leaderboardBg as any).isLeaderboardElement = true;

    // Display top scores
    this.topScores.slice(0, 10).forEach((scoreData, index) => {
      const yPos = 100 + index * 32;
      
      // Rank
      const rankText = this.add.text(width - 310, yPos, `${scoreData.rank}.`, {
        fontSize: '16px',
        color: this.getRankColor(scoreData.rank),
        fontStyle: 'bold',
      });
      (rankText as any).isLeaderboardElement = true;

      // Player name (username or displayName)
      const playerName = scoreData.username ? `@${scoreData.username}` : scoreData.displayName;
      const nameText = this.add.text(width - 285, yPos, playerName, {
        fontSize: '14px',
        color: '#ffffff',
      });
      (nameText as any).isLeaderboardElement = true;
      
      // Truncate long names
      if (playerName.length > 12) {
        nameText.setText(playerName.substring(0, 12) + '...');
      }

      // Score
      const scoreText = this.add.text(width - 40, yPos, scoreData.highScore.toString(), {
        fontSize: '14px',
        color: '#ffaa00',
        fontStyle: 'bold',
      });
      scoreText.setOrigin(1, 0);
      (scoreText as any).isLeaderboardElement = true;

      // Highlight current user's score
      if (this.authService.isSignedIn()) {
        // Note: We'd need to store userId in the ranking to make this work perfectly
        // For now, we'll highlight by score match as approximation
        if (scoreData.highScore === this.finalScore && this.isNewRecord) {
          const highlight = this.add.graphics();
          highlight.lineStyle(2, 0x00ff88, 1);
          highlight.strokeRoundedRect(width - 315, yPos - 2, 295, 28, 4);
          (highlight as any).isLeaderboardElement = true;
        }
      }
    });

    // If no scores available
    if (this.topScores.length === 0) {
      const noScoresText = this.add.text(width - 170, 150, 'No scores yet!\nBe the first!', {
        fontSize: '16px',
        color: '#aaaaaa',
        align: 'center',
      });
      noScoresText.setOrigin(0.5, 0);      (noScoresText as any).isLeaderboardElement = true;    }
  }

  private getRankColor(rank: number): string {
    switch (rank) {
      case 1: return '#FFD700'; // Gold
      case 2: return '#C0C0C0'; // Silver
      case 3: return '#CD7F32'; // Bronze
      default: return '#ffffff'; // White
    }
  }

  private updateLeaderboardDisplay(): void {
    // Clear existing leaderboard elements
    this.children.list
      .filter(child => (child as any).isLeaderboardElement)
      .forEach(child => child.destroy());
    
    const width = this.cameras.main.width;
    
    this.createLeaderboard(width);
  }
}

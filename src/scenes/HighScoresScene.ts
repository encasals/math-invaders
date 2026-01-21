import Phaser from 'phaser';
import { AuthService } from '../firebase/authService';

export class HighScoresScene extends Phaser.Scene {
  private authService: AuthService;
  private topScores: Array<{ username: string; displayName: string; highScore: number; rank: number }> = [];
  private highScoresContainer?: Phaser.GameObjects.Container;
  private isLoadingScores = false;

  constructor() {
    super('HighScoresScene');
    this.authService = AuthService.getInstance();
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);

    // Title
    const title = this.add.text(width / 2, height * 0.1, 'HIGH SCORES', {
      fontSize: `${Math.min(48, width * 0.12)}px`,
      color: '#00ff88',
      fontStyle: 'bold',
      align: 'center',
    });
    title.setOrigin(0.5);

    // Subtitle
    const subtitle = this.add.text(width / 2, height * 0.16, 'Top Players', {
      fontSize: '20px',
      color: '#ffffff',
    });
    subtitle.setOrigin(0.5);

    // Create the main leaderboard panel
    this.createLeaderboardPanel(width, height);

    // Back button
    this.createBackButton(width, height);

    // Refresh button
    this.createRefreshButton(width, height);

    // Load scores
    this.loadTopScores();
  }

  private createLeaderboardPanel(width: number, height: number): void {
    // Panel background
    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x2a2a3e, 0.95);
    panelBg.lineStyle(3, 0x00ff88);
    panelBg.fillRoundedRect(width * 0.1, height * 0.22, width * 0.8, height * 0.6, 15);
    panelBg.strokeRoundedRect(width * 0.1, height * 0.22, width * 0.8, height * 0.6, 15);

    // Header row
    const headerY = height * 0.26;
    this.add.text(width * 0.15, headerY, 'RANK', {
      fontSize: '16px',
      color: '#00ff88',
      fontStyle: 'bold',
    });

    this.add.text(width * 0.3, headerY, 'PLAYER', {
      fontSize: '16px',
      color: '#00ff88',
      fontStyle: 'bold',
    });

    this.add.text(width * 0.85, headerY, 'SCORE', {
      fontSize: '16px',
      color: '#00ff88',
      fontStyle: 'bold',
    }).setOrigin(1, 0);

    // Divider line
    const divider = this.add.graphics();
    divider.lineStyle(2, 0x00ff88, 0.5);
    divider.lineBetween(width * 0.15, headerY + 25, width * 0.85, headerY + 25);

    // Create container for scores list
    this.highScoresContainer = this.add.container(0, 0);

    // Initial loading text
    const loadingText = this.add.text(width / 2, height * 0.5, 'Loading scores...', {
      fontSize: '18px',
      color: '#aaaaaa',
      fontStyle: 'italic',
    });
    loadingText.setOrigin(0.5);
    this.highScoresContainer.add(loadingText);
  }

  private createBackButton(width: number, height: number): void {
    // Back button
    const backButton = this.add.graphics();
    backButton.fillStyle(0x444444, 1);
    backButton.fillRoundedRect(width * 0.1, height * 0.88, 120, 50, 10);

    const backText = this.add.text(width * 0.1 + 60, height * 0.88 + 25, 'BACK', {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    backText.setOrigin(0.5);

    // Make back button interactive
    const backHitArea = this.add.rectangle(width * 0.1 + 60, height * 0.88 + 25, 120, 50);
    backHitArea.setInteractive({ useHandCursor: true });

    backHitArea.on('pointerdown', () => {
      backButton.clear();
      backButton.fillStyle(0x333333, 1);
      backButton.fillRoundedRect(width * 0.1, height * 0.88, 120, 50, 10);
    });

    backHitArea.on('pointerup', () => {
      this.scene.start('MainMenu');
    });

    backHitArea.on('pointerout', () => {
      backButton.clear();
      backButton.fillStyle(0x444444, 1);
      backButton.fillRoundedRect(width * 0.1, height * 0.88, 120, 50, 10);
    });
  }

  private createRefreshButton(width: number, height: number): void {
    // Refresh button
    const refreshButton = this.add.graphics();
    refreshButton.fillStyle(0x00ff88, 1);
    refreshButton.fillRoundedRect(width * 0.9 - 60, height * 0.88, 120, 50, 10);

    const refreshText = this.add.text(width * 0.9, height * 0.88 + 25, 'REFRESH', {
      fontSize: '16px',
      color: '#000000',
      fontStyle: 'bold',
    });
    refreshText.setOrigin(0.5);

    // Make refresh button interactive
    const refreshHitArea = this.add.rectangle(width * 0.9, height * 0.88 + 25, 120, 50);
    refreshHitArea.setInteractive({ useHandCursor: true });

    refreshHitArea.on('pointerdown', () => {
      if (!this.isLoadingScores) {
        refreshButton.clear();
        refreshButton.fillStyle(0x00cc66, 1);
        refreshButton.fillRoundedRect(width * 0.9 - 60, height * 0.88, 120, 50, 10);
        this.loadTopScores(true); // Force refresh
      }
    });

    refreshHitArea.on('pointerup', () => {
      refreshButton.clear();
      refreshButton.fillStyle(0x00ff88, 1);
      refreshButton.fillRoundedRect(width * 0.9 - 60, height * 0.88, 120, 50, 10);
    });

    refreshHitArea.on('pointerout', () => {
      refreshButton.clear();
      refreshButton.fillStyle(0x00ff88, 1);
      refreshButton.fillRoundedRect(width * 0.9 - 60, height * 0.88, 120, 50, 10);
    });
  }

  private async loadTopScores(forceRefresh: boolean = false): Promise<void> {
    if (this.isLoadingScores) return;
    
    try {
      this.isLoadingScores = true;
      this.topScores = await this.authService.getTopScores(forceRefresh);
      this.updateHighScoresDisplay();
    } catch (error) {
      console.error('Failed to load top scores:', error);
      this.showScoresError();
    } finally {
      this.isLoadingScores = false;
    }
  }

  private updateHighScoresDisplay(): void {
    if (!this.highScoresContainer) return;

    // Clear existing content
    this.highScoresContainer.removeAll(true);

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const startY = height * 0.32;
    
    if (this.topScores.length === 0) {
      const noScoresText = this.add.text(width / 2, height * 0.5, 'No scores yet.\nBe the first to play!', {
        fontSize: '20px',
        color: '#aaaaaa',
        align: 'center',
      });
      noScoresText.setOrigin(0.5);
      this.highScoresContainer.add(noScoresText);
      return;
    }

    // Get current user info for highlighting
    const currentUsername = this.authService.isSignedIn() ? 
      this.authService.getDisplayName() : null;

    // Display top 15 scores (more space in dedicated scene)
    const displayScores = this.topScores.slice(0, 15);
    
    displayScores.forEach((scoreData, index) => {
      const y = startY + (index * 28);
      
      // Check if this is the current user's score
      const isCurrentUser = currentUsername && 
        (scoreData.displayName === currentUsername || 
         scoreData.username === currentUsername);

      // Highlight current user's score
      if (isCurrentUser) {
        const highlight = this.add.graphics();
        highlight.fillStyle(0x00ff88, 0.15);
        highlight.fillRoundedRect(width * 0.12, y - 3, width * 0.76, 26, 5);
        this.highScoresContainer?.add(highlight);
      }
      
      // Rank number with medal emojis for top 3
      let rankDisplay = `${scoreData.rank}.`;
      if (scoreData.rank === 1) rankDisplay = '🥇';
      else if (scoreData.rank === 2) rankDisplay = '🥈';
      else if (scoreData.rank === 3) rankDisplay = '🥉';

      const rankColor = isCurrentUser ? '#00ff88' : 
                       scoreData.rank <= 3 ? '#ffaa00' : '#ffffff';
      const rankText = this.add.text(width * 0.15, y, rankDisplay, {
        fontSize: '16px',
        color: rankColor,
        fontStyle: 'bold',
      });

      // Player name (prefer username, fallback to display name)
      const playerName = scoreData.username || scoreData.displayName || 'Anonymous';
      const nameColor = isCurrentUser ? '#00ff88' : '#ffffff';
      const nameText = this.add.text(width * 0.3, y, playerName, {
        fontSize: '16px',
        color: nameColor,
        fontStyle: isCurrentUser ? 'bold' : 'normal',
      });
      
      // Truncate long names
      const maxWidth = width * 0.4;
      if (nameText.width > maxWidth) {
        nameText.setText(playerName.substring(0, 25) + '...');
      }

      // Score
      const scoreColor = isCurrentUser ? '#00ff88' : '#ffaa00';
      const scoreText = this.add.text(width * 0.85, y, scoreData.highScore.toLocaleString(), {
        fontSize: '16px',
        color: scoreColor,
        fontStyle: 'bold',
      });
      scoreText.setOrigin(1, 0);

      this.highScoresContainer?.add([rankText, nameText, scoreText]);
    });

    // Add user stats at bottom if signed in
    if (this.authService.isSignedIn() && currentUsername) {
      const userInList = this.topScores.find(score => {
        return score.displayName === currentUsername || 
               score.username === currentUsername;
      });

      const statsY = startY + (displayScores.length * 28) + 20;
      
      if (userInList) {
        const yourRankText = this.add.text(width / 2, statsY, 
          `🎯 Your Rank: #${userInList.rank} with ${userInList.highScore.toLocaleString()} points`, {
          fontSize: '16px',
          color: '#00ff88',
          fontStyle: 'bold',
        });
        yourRankText.setOrigin(0.5);
        this.highScoresContainer?.add(yourRankText);
      } else {
        const notRankedText = this.add.text(width / 2, statsY, 
          '🎮 Play to join the leaderboard!', {
          fontSize: '16px',
          color: '#ffaa00',
          fontStyle: 'italic',
        });
        notRankedText.setOrigin(0.5);
        this.highScoresContainer?.add(notRankedText);
      }
    }
  }

  private showScoresError(): void {
    if (!this.highScoresContainer) return;

    this.highScoresContainer.removeAll(true);
    
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const errorText = this.add.text(width / 2, height * 0.5, 'Failed to load scores\nCheck your connection', {
      fontSize: '18px',
      color: '#ff4444',
      fontStyle: 'italic',
      align: 'center',
    });
    errorText.setOrigin(0.5);
    this.highScoresContainer.add(errorText);
  }
}
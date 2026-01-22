import Phaser from 'phaser';

export class MainMenu extends Phaser.Scene {
  constructor() {
    super('MainMenu');
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Clean up any remaining HTML overlays from other scenes
    this.cleanupAnyRemainingOverlays();

    // Check if we should refresh scores (e.g., after completing a game)
    const sceneData = this.scene.settings.data as any;
    const shouldRefreshScores = sceneData?.refreshScores || false;
    if (shouldRefreshScores) {
      // Clear the flag
      this.scene.settings.data = { ...sceneData, refreshScores: false };
    }

    // Dynamic spacing with equal margins between ALL components
    const isSmallScreen = height < 700;
    const titleY = isSmallScreen ? height * 0.06 : height * 0.08;
    const subtitleOffset = isSmallScreen ? height * 0.08 : height * 0.10;
    const userInfoY = isSmallScreen ? height * 0.22 : height * 0.26;
    const howToPlayButtonY = isSmallScreen ? height * 0.30 : height * 0.36;
    const startButtonY = isSmallScreen ? height * 0.38 : height * 0.46;
    const highScoreButtonY = isSmallScreen ? height * 0.46 : height * 0.56;

    // Title
    const title = this.add.text(width / 2, titleY, 'MATH\nINVADERS', {
      fontSize: isSmallScreen ? '36px' : '64px',
      color: '#00ff88',
      fontStyle: 'bold',
      align: 'center',
    });
    title.setOrigin(0.5);

    // Subtitle
    const subtitle = this.add.text(width / 2, titleY + subtitleOffset, 'Sum to Destroy!', {
      fontSize: isSmallScreen ? '18px' : '24px',
      color: '#ffffff',
    });
    subtitle.setOrigin(0.5);

    // User info and high score (moved up under subtitle)
    this.displayUserInfo(width, userInfoY, isSmallScreen);

    // How to Play button
    this.createHowToPlayButton(width, howToPlayButtonY, isSmallScreen);

    // Start button
    const startButton = this.add.graphics();
    startButton.fillStyle(0x00ff88, 1);
    const buttonWidth = isSmallScreen ? 180 : 200;
    const buttonHeight = isSmallScreen ? 50 : 60;
    startButton.fillRoundedRect(width / 2 - buttonWidth/2, startButtonY, buttonWidth, buttonHeight, 15);

    const startText = this.add.text(width / 2, startButtonY + buttonHeight/2, 'START', {
      fontSize: isSmallScreen ? '24px' : '32px',
      color: '#000000',
      fontStyle: 'bold',
    });
    startText.setOrigin(0.5);

    // Make button interactive
    const hitArea = this.add.rectangle(width / 2, startButtonY + buttonHeight/2, buttonWidth, buttonHeight);
    hitArea.setInteractive({ useHandCursor: true });

    hitArea.on('pointerdown', () => {
      startButton.clear();
      startButton.fillStyle(0x00cc66, 1);
      startButton.fillRoundedRect(width / 2 - buttonWidth/2, startButtonY, buttonWidth, buttonHeight, 15);
    });

    hitArea.on('pointerup', () => {
      this.scene.start('Game');
    });

    hitArea.on('pointerout', () => {
      startButton.clear();
      startButton.fillStyle(0x00ff88, 1);
      startButton.fillRoundedRect(width / 2 - buttonWidth/2, startButtonY, buttonWidth, buttonHeight, 15);
    });

    // High Scores Button
    this.createHighScoresButton(width, highScoreButtonY, isSmallScreen);
  }

  private async displayUserInfo(width: number, baseY: number, isSmallScreen: boolean): Promise<void> {
    // Fallback to local storage for guests
    const highScore = localStorage.getItem('mathInvadersHighScore') || '0';
    const highScoreText = this.add.text(width / 2, baseY, `High Score: ${highScore}`, {
      fontSize: isSmallScreen ? '18px' : '20px',
      color: '#ffaa00',
    });
    highScoreText.setOrigin(0.5);
  }

  private createHighScoresButton(width: number, buttonY: number, isSmallScreen: boolean): void {
    const buttonWidth = isSmallScreen ? 180 : 200;
    const buttonHeight = isSmallScreen ? 40 : 50;
    
    // High Scores button
    const highScoresButton = this.add.graphics();
    highScoresButton.fillStyle(0x4444ff, 1);
    highScoresButton.fillRoundedRect(width / 2 - buttonWidth/2, buttonY, buttonWidth, buttonHeight, 12);

    const highScoresText = this.add.text(width / 2, buttonY + buttonHeight/2, 'HIGH SCORES', {
      fontSize: isSmallScreen ? '16px' : '20px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    highScoresText.setOrigin(0.5);

    // Make button interactive
    const hitArea = this.add.rectangle(width / 2, buttonY + buttonHeight/2, buttonWidth, buttonHeight);
    hitArea.setInteractive({ useHandCursor: true });

    hitArea.on('pointerdown', () => {
      highScoresButton.clear();
      highScoresButton.fillStyle(0x3333cc, 1);
      highScoresButton.fillRoundedRect(width / 2 - buttonWidth/2, buttonY, buttonWidth, buttonHeight, 12);
    });

    hitArea.on('pointerup', () => {
      this.scene.start('HighScoresScene');
    });

    hitArea.on('pointerout', () => {
      highScoresButton.clear();
      highScoresButton.fillStyle(0x4444ff, 1);
      highScoresButton.fillRoundedRect(width / 2 - buttonWidth/2, buttonY, buttonWidth, buttonHeight, 12);
    });
  }

  private createHowToPlayButton(width: number, buttonY: number, isSmallScreen: boolean): void {
    const buttonWidth = isSmallScreen ? 160 : 180;
    const buttonHeight = isSmallScreen ? 35 : 45;
    
    // How to Play button
    const howToPlayButton = this.add.graphics();
    howToPlayButton.fillStyle(0x8833ff, 1);
    howToPlayButton.fillRoundedRect(width / 2 - buttonWidth/2, buttonY, buttonWidth, buttonHeight, 10);

    const howToPlayText = this.add.text(width / 2, buttonY + buttonHeight/2, 'HOW TO PLAY', {
      fontSize: isSmallScreen ? '14px' : '18px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    howToPlayText.setOrigin(0.5);

    // Make button interactive
    const hitArea = this.add.rectangle(width / 2, buttonY + buttonHeight/2, buttonWidth, buttonHeight);
    hitArea.setInteractive({ useHandCursor: true });

    hitArea.on('pointerdown', () => {
      howToPlayButton.clear();
      howToPlayButton.fillStyle(0x6622cc, 1);
      howToPlayButton.fillRoundedRect(width / 2 - buttonWidth/2, buttonY, buttonWidth, buttonHeight, 10);
    });

    hitArea.on('pointerup', () => {
      this.scene.start('HowToPlayScene');
    });

    hitArea.on('pointerout', () => {
      howToPlayButton.clear();
      howToPlayButton.fillStyle(0x8833ff, 1);
      howToPlayButton.fillRoundedRect(width / 2 - buttonWidth/2, buttonY, buttonWidth, buttonHeight, 10);
    });
  }

  private cleanupAnyRemainingOverlays(): void {
    try {
      // Remove any overlays with our specific styling
      const overlays = document.querySelectorAll('div[style*="position: fixed"][style*="z-index: 1000"]');
      overlays.forEach(overlay => {
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
      });
      
      // Also clean up form containers that might be orphaned
      const formContainers = document.querySelectorAll('div[style*="display: flex"][style*="flex-direction: column"]');
      formContainers.forEach(container => {
        const parent = container.parentElement;
        if (parent && parent.style.zIndex === '1000') {
          if (parent.parentNode) {
            parent.parentNode.removeChild(parent);
          }
        }
      });
    } catch (error) {
      console.error('Error cleaning up overlays:', error);
    }
  }
}

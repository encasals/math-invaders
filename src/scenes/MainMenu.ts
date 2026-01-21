import Phaser from 'phaser';
import { AuthService } from '../firebase/authService';

export class MainMenu extends Phaser.Scene {
  private authService: AuthService;

  constructor() {
    super('MainMenu');
    this.authService = AuthService.getInstance();
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
    const profileButtonY = isSmallScreen ? height * 0.54 : height * 0.66;
    const logoutButtonY = isSmallScreen ? height * 0.62 : height * 0.76;

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

    // Profile button (if signed in)
    if (this.authService.isSignedIn()) {
      this.createProfileButton(width, profileButtonY, isSmallScreen);
    }

    // Logout button (if signed in)
    if (this.authService.isSignedIn()) {
      this.createLogoutButton(width, logoutButtonY, isSmallScreen);
    }
  }

  private async displayUserInfo(width: number, baseY: number, isSmallScreen: boolean): Promise<void> {
    
    if (this.authService.isSignedIn()) {
      const displayName = this.authService.getDisplayName();
      const username = await this.authService.getUserUsername();
      const highScore = await this.authService.getUserHighScore();

      // User greeting with username if available
      const greeting = username ? `@${username}` : displayName;
      const userText = this.add.text(width / 2, baseY, `Welcome, ${greeting}!`, {
        fontSize: isSmallScreen ? '16px' : '18px',
        color: '#00ff88',
        fontStyle: 'bold',
      });
      userText.setOrigin(0.5);

      // Username status
      if (!username) {
        const noUsernameText = this.add.text(width / 2, baseY + (isSmallScreen ? 18 : 22), 'Set up your username', {
          fontSize: isSmallScreen ? '12px' : '14px',
          color: '#ffaa00',
          fontStyle: 'italic',
        });
        noUsernameText.setOrigin(0.5);
      }

      // High score from Firebase
      const highScoreY = username ? baseY + (isSmallScreen ? 38 : 45) : baseY + (isSmallScreen ? 18 : 22);
      const highScoreText = this.add.text(width / 2, highScoreY, `High Score: ${highScore}`, {
        fontSize: isSmallScreen ? '14px' : '16px',
        color: '#ffaa00',
      });
      highScoreText.setOrigin(0.5);
    } else {
      // Fallback to local storage for guests
      const highScore = localStorage.getItem('mathInvadersHighScore') || '0';
      const highScoreText = this.add.text(width / 2, baseY, `High Score: ${highScore}`, {
        fontSize: isSmallScreen ? '18px' : '20px',
        color: '#ffaa00',
      });
      highScoreText.setOrigin(0.5);
    }
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

  private createLogoutButton(width: number, logoutY: number, isSmallScreen: boolean): void {
    const buttonHeight = isSmallScreen ? 35 : 40;
    
    const logoutButton = this.add.graphics();
    logoutButton.fillStyle(0xff4444, 1);
    logoutButton.fillRoundedRect(width / 2 - 60, logoutY, 120, buttonHeight, 10);

    const logoutText = this.add.text(width / 2, logoutY + buttonHeight/2, 'LOGOUT', {
      fontSize: isSmallScreen ? '14px' : '16px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    logoutText.setOrigin(0.5);

    // Make logout button interactive
    const hitArea = this.add.rectangle(width / 2, logoutY + buttonHeight/2, 120, buttonHeight);
    hitArea.setInteractive({ useHandCursor: true });

    hitArea.on('pointerdown', () => {
      logoutButton.clear();
      logoutButton.fillStyle(0xcc3333, 1);
      logoutButton.fillRoundedRect(width / 2 - 60, logoutY, 120, buttonHeight, 10);
    });

    hitArea.on('pointerup', async () => {
      try {
        await this.authService.signOut();
        this.scene.start('AuthScene');
      } catch (error) {
        console.error('Error signing out:', error);
      }
    });

    hitArea.on('pointerout', () => {
      logoutButton.clear();
      logoutButton.fillStyle(0xff4444, 1);
      logoutButton.fillRoundedRect(width / 2 - 60, logoutY, 120, buttonHeight, 10);
    });
  }

  private createProfileButton(width: number, profileY: number, isSmallScreen: boolean): void {
    const buttonHeight = isSmallScreen ? 30 : 35;
    const buttonWidth = isSmallScreen ? 140 : 160;
    
    const profileButton = this.add.graphics();
    profileButton.fillStyle(0x4285f4, 1);
    profileButton.fillRoundedRect(width / 2 - buttonWidth/2, profileY, buttonWidth, buttonHeight, 8);

    const profileText = this.add.text(width / 2, profileY + buttonHeight/2, 'SETUP PROFILE', {
      fontSize: isSmallScreen ? '12px' : '14px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    profileText.setOrigin(0.5);

    // Make profile button interactive
    const hitArea = this.add.rectangle(width / 2, profileY + buttonHeight/2, buttonWidth, buttonHeight);
    hitArea.setInteractive({ useHandCursor: true });

    hitArea.on('pointerdown', () => {
      profileButton.clear();
      profileButton.fillStyle(0x357ae8, 1);
      profileButton.fillRoundedRect(width / 2 - buttonWidth/2, profileY, buttonWidth, buttonHeight, 8);
    });

    hitArea.on('pointerup', () => {
      this.scene.start('ProfileScene');
    });

    hitArea.on('pointerout', () => {
      profileButton.clear();
      profileButton.fillStyle(0x4285f4, 1);
      profileButton.fillRoundedRect(width / 2 - buttonWidth/2, profileY, buttonWidth, buttonHeight, 8);
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

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

    // Title
    const title = this.add.text(width / 2, height / 4, 'MATH\nINVADERS', {
      fontSize: '64px',
      color: '#00ff88',
      fontStyle: 'bold',
      align: 'center',
    });
    title.setOrigin(0.5);

    // Subtitle
    const subtitle = this.add.text(width / 2, height / 4 + 80, 'Sum to Destroy!', {
      fontSize: '24px',
      color: '#ffffff',
    });
    subtitle.setOrigin(0.5);

    // Instructions
    const instructions = this.add.text(width / 2, height / 2 - 40, 
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
    startButton.fillRoundedRect(width / 2 - 100, height * 0.62, 200, 60, 15);

    const startText = this.add.text(width / 2, height * 0.62 + 30, 'START', {
      fontSize: '32px',
      color: '#000000',
      fontStyle: 'bold',
    });
    startText.setOrigin(0.5);

    // Make button interactive
    const hitArea = this.add.rectangle(width / 2, height * 0.62 + 30, 200, 60);
    hitArea.setInteractive({ useHandCursor: true });

    hitArea.on('pointerdown', () => {
      startButton.clear();
      startButton.fillStyle(0x00cc66, 1);
      startButton.fillRoundedRect(width / 2 - 100, height * 0.62, 200, 60, 15);
    });

    hitArea.on('pointerup', () => {
      this.scene.start('Game');
    });

    hitArea.on('pointerout', () => {
      startButton.clear();
      startButton.fillStyle(0x00ff88, 1);
      startButton.fillRoundedRect(width / 2 - 100, height * 0.62, 200, 60, 15);
    });

    // User info and high score
    this.displayUserInfo(width, height);

    // Profile button (if signed in)
    if (this.authService.isSignedIn()) {
      this.createProfileButton(width, height);
    }

    // Logout button (if signed in)
    if (this.authService.isSignedIn()) {
      this.createLogoutButton(width, height);
    }
  }

  private async displayUserInfo(width: number, height: number): Promise<void> {
    if (this.authService.isSignedIn()) {
      const displayName = this.authService.getDisplayName();
      const username = await this.authService.getUserUsername();
      const highScore = await this.authService.getUserHighScore();

      // User greeting with username if available
      const greeting = username ? `@${username}` : displayName;
      const userText = this.add.text(width / 2, height * 0.70, `Welcome, ${greeting}!`, {
        fontSize: '18px',
        color: '#00ff88',
        fontStyle: 'bold',
      });
      userText.setOrigin(0.5);

      // Username status
      if (!username) {
        const noUsernameText = this.add.text(width / 2, height * 0.74, 'Set up your username', {
          fontSize: '14px',
          color: '#ffaa00',
          fontStyle: 'italic',
        });
        noUsernameText.setOrigin(0.5);
      }

      // High score from Firebase
      const highScoreText = this.add.text(width / 2, height * 0.78, `High Score: ${highScore}`, {
        fontSize: '16px',
        color: '#ffaa00',
      });
      highScoreText.setOrigin(0.5);
    } else {
      // Fallback to local storage for guests
      const highScore = localStorage.getItem('mathInvadersHighScore') || '0';
      const highScoreText = this.add.text(width / 2, height * 0.85, `High Score: ${highScore}`, {
        fontSize: '20px',
        color: '#ffaa00',
      });
      highScoreText.setOrigin(0.5);
    }
  }

  private createLogoutButton(width: number, height: number): void {
    const logoutButton = this.add.graphics();
    logoutButton.fillStyle(0xff4444, 1);
    logoutButton.fillRoundedRect(width / 2 - 60, height * 0.90, 120, 40, 10);

    const logoutText = this.add.text(width / 2, height * 0.90 + 20, 'LOGOUT', {
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    logoutText.setOrigin(0.5);

    // Make logout button interactive
    const hitArea = this.add.rectangle(width / 2, height * 0.90 + 20, 120, 40);
    hitArea.setInteractive({ useHandCursor: true });

    hitArea.on('pointerdown', () => {
      logoutButton.clear();
      logoutButton.fillStyle(0xcc3333, 1);
      logoutButton.fillRoundedRect(width / 2 - 60, height * 0.90, 120, 40, 10);
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
      logoutButton.fillRoundedRect(width / 2 - 60, height * 0.90, 120, 40, 10);
    });
  }

  private createProfileButton(width: number, height: number): void {
    const profileButton = this.add.graphics();
    profileButton.fillStyle(0x4285f4, 1);
    profileButton.fillRoundedRect(width / 2 - 80, height * 0.83, 160, 35, 8);

    const profileText = this.add.text(width / 2, height * 0.83 + 17.5, 'SETUP PROFILE', {
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    profileText.setOrigin(0.5);

    // Make profile button interactive
    const hitArea = this.add.rectangle(width / 2, height * 0.83 + 17.5, 160, 35);
    hitArea.setInteractive({ useHandCursor: true });

    hitArea.on('pointerdown', () => {
      profileButton.clear();
      profileButton.fillStyle(0x357ae8, 1);
      profileButton.fillRoundedRect(width / 2 - 80, height * 0.83, 160, 35, 8);
    });

    hitArea.on('pointerup', () => {
      this.scene.start('ProfileScene');
    });

    hitArea.on('pointerout', () => {
      profileButton.clear();
      profileButton.fillStyle(0x4285f4, 1);
      profileButton.fillRoundedRect(width / 2 - 80, height * 0.83, 160, 35, 8);
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

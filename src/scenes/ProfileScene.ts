import Phaser from 'phaser';
import { AuthService } from '../firebase/authService';

export class ProfileScene extends Phaser.Scene {
  private authService: AuthService;
  private formContainer!: HTMLDivElement;
  private overlay!: HTMLDivElement;
  private currentUsername: string | null = null;

  constructor() {
    super('ProfileScene');
    this.authService = AuthService.getInstance();
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Verify user is authenticated
    if (!this.authService.isSignedIn()) {
      console.error('User not authenticated, redirecting to AuthScene');
      this.scene.start('AuthScene');
      return;
    }

    // Create background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);

    // Title
    const title = this.add.text(width / 2, height / 6, 'CONFIGURAR\nPERFIL', {
      fontSize: '36px',
      color: '#00ff88',
      fontStyle: 'bold',
      align: 'center',
    });
    title.setOrigin(0.5);

    // Back button
    this.createButton(
      50, 
      50, 
      '← BACK', 
      '#666666', 
      () => {
        this.cleanupHTML();
        this.scene.start('MainMenu');
      }
    );

    // Create HTML overlay for username form
    this.createHTMLOverlay();

    // Listen for scene shutdown to cleanup HTML
    this.events.once('shutdown', () => {
      this.cleanupHTML();
    });

    this.loadCurrentUsername();
  }

  private async loadCurrentUsername(): Promise<void> {
    try {
      console.log('Loading current username...');
      this.currentUsername = await this.authService.getUserUsername();
      console.log('Current username:', this.currentUsername);
      this.createUsernameForm();
    } catch (error) {
      console.error('Error loading username:', error);
      this.createUsernameForm();
    }
  }

  private createHTMLOverlay(): void {
    // Create overlay
    this.overlay = document.createElement('div');
    this.overlay.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 1000;
      background: rgba(26, 26, 46, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 15px;
      border: 2px solid #00ff88;
      padding: 30px;
      box-shadow: 0 10px 30px rgba(0, 255, 136, 0.2);
      min-width: 350px;
      max-width: 90vw;
    `;

    // Create form container
    this.formContainer = document.createElement('div');
    this.formContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 20px;
      font-family: Arial, sans-serif;
    `;

    this.overlay.appendChild(this.formContainer);
    document.body.appendChild(this.overlay);
  }

  private createUsernameForm(): void {
    this.formContainer.innerHTML = '';

    const title = document.createElement('h2');
    title.textContent = 'Username';
    title.style.cssText = `
      color: #00ff88;
      text-align: center;
      margin: 0 0 20px 0;
      font-size: 24px;
      font-weight: bold;
    `;

    const description = document.createElement('p');
    description.textContent = 'Choose a unique name to identify you in the game. Minimum 3 characters.';
    description.style.cssText = `
      color: #aaaaaa;
      text-align: center;
      margin: 0 0 20px 0;
      font-size: 14px;
      line-height: 1.4;
    `;

    const usernameInput = this.createInput('text', 'Username');
    if (this.currentUsername) {
      (usernameInput as HTMLInputElement).value = this.currentUsername;
    }

    const checkButton = document.createElement('button');
    checkButton.textContent = 'Verificar Disponibilidad';
    checkButton.style.cssText = `
      background: #4285f4;
      color: white;
      border: none;
      padding: 10px;
      border-radius: 8px;
      font-size: 14px;
      cursor: pointer;
      transition: background 0.2s;
    `;

    const saveButton = document.createElement('button');
    saveButton.textContent = this.currentUsername ? 'Actualizar Username' : 'Guardar Username';
    saveButton.style.cssText = `
      background: #00ff88;
      color: #000;
      border: none;
      padding: 15px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      transition: background 0.2s;
    `;

    const statusDiv = document.createElement('div');
    statusDiv.style.cssText = `
      text-align: center;
      font-size: 14px;
      min-height: 20px;
      padding: 10px;
      border-radius: 8px;
    `;

    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      color: #ff4444;
      text-align: center;
      font-size: 14px;
      min-height: 20px;
    `;

    // Event listeners
    checkButton.onclick = async () => {
      try {
        const username = (usernameInput as HTMLInputElement).value.trim();
        
        if (!username) {
          statusDiv.textContent = 'Enter a username';
          statusDiv.style.color = '#ff4444';
          statusDiv.style.background = 'rgba(255, 68, 68, 0.1)';
          return;
        }

        if (username.length < 3) {
          statusDiv.textContent = 'Name must be at least 3 characters';
          statusDiv.style.color = '#ff4444';
          statusDiv.style.background = 'rgba(255, 68, 68, 0.1)';
          return;
        }

        if (username === this.currentUsername) {
          statusDiv.textContent = 'This is already your current name';
          statusDiv.style.color = '#ffaa00';
          statusDiv.style.background = 'rgba(255, 170, 0, 0.1)';
          return;
        }

        statusDiv.textContent = 'Verificando...';
        statusDiv.style.color = '#00ff88';
        statusDiv.style.background = 'rgba(0, 255, 136, 0.1)';

        const isAvailable = await this.authService.isUsernameAvailable(username);
        
        if (isAvailable) {
          statusDiv.textContent = '✓ Available';
          statusDiv.style.color = '#00ff88';
          statusDiv.style.background = 'rgba(0, 255, 136, 0.1)';
        } else {
          statusDiv.textContent = '✗ Not available';
          statusDiv.style.color = '#ff4444';
          statusDiv.style.background = 'rgba(255, 68, 68, 0.1)';
        }
      } catch (error: any) {
        statusDiv.textContent = 'Error verifying';
        statusDiv.style.color = '#ff4444';
        statusDiv.style.background = 'rgba(255, 68, 68, 0.1)';
      }
    };

    saveButton.onclick = async () => {
      try {
        errorDiv.textContent = '';
        statusDiv.textContent = '';
        
        const username = (usernameInput as HTMLInputElement).value.trim();

        if (!username) {
          errorDiv.textContent = 'Enter a username';
          return;
        }

        if (username.length < 3) {
          errorDiv.textContent = 'Name must be at least 3 characters';
          return;
        }

        if (username === this.currentUsername) {
          errorDiv.textContent = 'This is already your current name';
          return;
        }

        // Validate username format (only letters, numbers, underscore)
        const usernameRegex = /^[a-zA-Z0-9_]+$/;
        if (!usernameRegex.test(username)) {
          errorDiv.textContent = 'Only letters, numbers and underscores allowed';
          return;
        }

        statusDiv.textContent = 'Saving...';
        statusDiv.style.color = '#00ff88';
        statusDiv.style.background = 'rgba(0, 255, 136, 0.1)';

        await this.authService.updateUsername(username);
        
        statusDiv.textContent = '✓ Username saved successfully';
        statusDiv.style.color = '#00ff88';
        statusDiv.style.background = 'rgba(0, 255, 136, 0.1)';

        // Wait a moment and go back to main menu
        setTimeout(() => {
          this.cleanupHTML();
          this.scene.start('MainMenu');
        }, 1500);

      } catch (error: any) {
        errorDiv.textContent = error.message;
        statusDiv.textContent = '';
      }
    };

    // Add enter key support for inputs
    const handleEnter = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        checkButton.click();
      }
    };
    usernameInput.addEventListener('keypress', handleEnter);

    // Hover effects
    checkButton.onmouseover = () => checkButton.style.background = '#357ae8';
    checkButton.onmouseout = () => checkButton.style.background = '#4285f4';
    
    saveButton.onmouseover = () => saveButton.style.background = '#00cc66';
    saveButton.onmouseout = () => saveButton.style.background = '#00ff88';

    // Add current username info if exists
    if (this.currentUsername) {
      const currentInfo = document.createElement('p');
      currentInfo.textContent = `Username actual: ${this.currentUsername}`;
      currentInfo.style.cssText = `
        color: #00ff88;
        text-align: center;
        margin: 0;
        font-size: 14px;
        background: rgba(0, 255, 136, 0.1);
        padding: 8px;
        border-radius: 6px;
      `;
      this.formContainer.appendChild(currentInfo);
    }

    this.formContainer.appendChild(title);
    this.formContainer.appendChild(description);
    this.formContainer.appendChild(usernameInput);
    this.formContainer.appendChild(checkButton);
    this.formContainer.appendChild(statusDiv);
    this.formContainer.appendChild(saveButton);
    this.formContainer.appendChild(errorDiv);
  }

  private createInput(type: string, placeholder: string): HTMLInputElement {
    const input = document.createElement('input');
    input.type = type;
    input.placeholder = placeholder;
    input.maxLength = 20; // Limit username length
    input.style.cssText = `
      padding: 12px;
      border: 1px solid #333;
      border-radius: 8px;
      background: #2a2a3e;
      color: white;
      font-size: 16px;
      outline: none;
      transition: border-color 0.2s;
    `;
    input.onfocus = () => input.style.borderColor = '#00ff88';
    input.onblur = () => input.style.borderColor = '#333';
    return input;
  }

  private createButton(x: number, y: number, text: string, color: string, onClick: () => void): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    const background = this.add.graphics();
    background.fillStyle(parseInt(color.replace('#', '0x')), 1);
    background.fillRoundedRect(-60, -20, 120, 40, 8);

    const buttonText = this.add.text(0, 0, text, {
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    buttonText.setOrigin(0.5);

    const hitArea = this.add.rectangle(0, 0, 120, 40);
    hitArea.setInteractive({ useHandCursor: true });

    hitArea.on('pointerdown', () => {
      background.clear();
      background.fillStyle(parseInt(color.replace('#', '0x')) - 0x222222, 1);
      background.fillRoundedRect(-60, -20, 120, 40, 8);
    });

    hitArea.on('pointerup', onClick);

    hitArea.on('pointerout', () => {
      background.clear();
      background.fillStyle(parseInt(color.replace('#', '0x')), 1);
      background.fillRoundedRect(-60, -20, 120, 40, 8);
    });

    container.add([background, buttonText, hitArea]);
    return container;
  }

  private cleanupHTML(): void {
    try {
      if (this.overlay && this.overlay.parentNode) {
        this.overlay.parentNode.removeChild(this.overlay);
        this.overlay = null as any;
      }
    } catch (error) {
      console.error('Error cleaning up HTML:', error);
    }
  }

  destroy(): void {
    this.cleanupHTML();
  }
}
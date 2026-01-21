import Phaser from 'phaser';
import { AuthService } from '../firebase/authService';

export class AuthScene extends Phaser.Scene {
  private authService: AuthService;
  private formContainer!: HTMLDivElement;
  private overlay!: HTMLDivElement;
  private isLoginMode = true;

  constructor() {
    super('AuthScene');
    this.authService = AuthService.getInstance();
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Check if user is already signed in
    if (this.authService.isSignedIn()) {
      this.scene.start('MainMenu');
      return;
    }

    // Create background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);

    // Title
    const title = this.add.text(width / 2, height / 8, 'MATH\nINVADERS', {
      fontSize: `${Math.min(40, width * 0.1)}px`,
      color: '#00ff88',
      fontStyle: 'bold',
      align: 'center',
    });
    title.setOrigin(0.5);

    // Create HTML overlay for forms
    this.createHTMLOverlay();

    // Listen for auth state changes
    this.authService.onAuthStateChange((user) => {
      if (user) {
        this.cleanupHTML();
        this.scene.start('MainMenu');
      }
    });
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
      padding: 16px;
      margin: 16px;
      width: 92vw;
      max-width: 380px;
      min-width: 280px;
      max-height: 85vh;
      overflow-y: auto;
    `;

    // Create form container
    this.formContainer = document.createElement('div');
    this.formContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 16px;
      font-family: Arial, sans-serif;
      align-items: center;
    `;

    this.overlay.appendChild(this.formContainer);
    document.body.appendChild(this.overlay);

    this.createLoginForm();
  }

  private createLoginForm(): void {
    this.formContainer.innerHTML = '';

    const title = document.createElement('h2');
    title.textContent = this.isLoginMode ? 'Sign In' : 'Sign Up';
    title.style.cssText = `
      color: #00ff88;
      text-align: center;
      margin: 0 0 12px 0;
      font-size: clamp(18px, 4.5vw, 22px);
      font-weight: bold;
    `;

    const emailInput = this.createInput('email', 'Email');
    const passwordInput = this.createInput('password', 'Password');

    const submitButton = document.createElement('button');
    submitButton.textContent = this.isLoginMode ? 'Sign In' : 'Sign Up';
    submitButton.style.cssText = `
      background: #00ff88;
      color: #000;
      border: none;
      padding: 14px;
      border-radius: 8px;
      font-size: clamp(14px, 4vw, 16px);
      font-weight: bold;
      cursor: pointer;
      transition: background 0.2s;
      min-height: 46px;
      width: 100%;
    `;
    submitButton.onmouseover = () => submitButton.style.background = '#00cc66';
    submitButton.onmouseout = () => submitButton.style.background = '#00ff88';

    const toggleButton = document.createElement('button');
    toggleButton.textContent = this.isLoginMode ? 'Need an account? Sign Up' : 'Already have an account? Sign In';
    toggleButton.style.cssText = `
      background: none;
      color: #00ff88;
      border: 1px solid #00ff88;
      padding: 10px;
      border-radius: 8px;
      font-size: clamp(11px, 3.2vw, 13px);
      cursor: pointer;
      transition: all 0.2s;
      min-height: 42px;
      text-align: center;
      width: 100%;
    `;
    toggleButton.onmouseover = () => {
      toggleButton.style.background = '#00ff88';
      toggleButton.style.color = '#000';
    };
    toggleButton.onmouseout = () => {
      toggleButton.style.background = 'none';
      toggleButton.style.color = '#00ff88';
    };

    const googleButton = document.createElement('button');
    googleButton.textContent = 'Sign in with Google';
    googleButton.style.cssText = `
      background: #4285f4;
      color: white;
      border: none;
      padding: 10px;
      border-radius: 8px;
      font-size: clamp(12px, 3.5vw, 14px);
      cursor: pointer;
      transition: background 0.2s;
      min-height: 42px;
      width: 100%;
    `;
    googleButton.onmouseover = () => googleButton.style.background = '#357ae8';
    googleButton.onmouseout = () => googleButton.style.background = '#4285f4';

    const guestButton = document.createElement('button');
    guestButton.textContent = 'Play as Guest';
    guestButton.style.cssText = `
      background: #666666;
      color: white;
      border: none;
      padding: 10px;
      border-radius: 8px;
      font-size: clamp(12px, 3.5vw, 14px);
      cursor: pointer;
      transition: background 0.2s;
      min-height: 42px;
      width: 100%;
    `;
    guestButton.onmouseover = () => guestButton.style.background = '#555555';
    guestButton.onmouseout = () => guestButton.style.background = '#666666';

    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      color: #ff4444;
      text-align: center;
      font-size: 14px;
      min-height: 20px;
    `;

    // Event listeners
    submitButton.onclick = async () => {
      try {
        errorDiv.textContent = '';
        const email = (emailInput as HTMLInputElement).value;
        const password = (passwordInput as HTMLInputElement).value;

        if (!email || !password) {
          errorDiv.textContent = 'Please fill in all fields';
          return;
        }

        if (this.isLoginMode) {
          await this.authService.signIn(email, password);
        } else {
          await this.authService.signUp(email, password);
        }
      } catch (error: any) {
        errorDiv.textContent = error.message;
      }
    };

    toggleButton.onclick = () => {
      this.isLoginMode = !this.isLoginMode;
      this.createLoginForm();
    };

    googleButton.onclick = async () => {
      try {
        errorDiv.textContent = '';
        await this.authService.signInWithGoogle();
      } catch (error: any) {
        errorDiv.textContent = error.message;
      }
    };

    guestButton.onclick = () => {
      this.cleanupHTML();
      this.scene.start('MainMenu');
    };

    // Add enter key support
    const handleEnter = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        submitButton.click();
      }
    };
    emailInput.addEventListener('keypress', handleEnter);
    passwordInput.addEventListener('keypress', handleEnter);

    this.formContainer.appendChild(title);
    this.formContainer.appendChild(emailInput);
    this.formContainer.appendChild(passwordInput);
    this.formContainer.appendChild(submitButton);
    this.formContainer.appendChild(toggleButton);
    this.formContainer.appendChild(document.createElement('hr'));
    this.formContainer.appendChild(googleButton);
    this.formContainer.appendChild(guestButton);
    this.formContainer.appendChild(errorDiv);
  }

  private createInput(type: string, placeholder: string): HTMLInputElement {
    const input = document.createElement('input');
    input.type = type;
    input.placeholder = placeholder;
    input.style.cssText = `
      padding: 13px 12px;
      border: 1px solid #333;
      border-radius: 8px;
      background: #2a2a3e;
      color: white;
      font-size: clamp(14px, 4vw, 16px);
      outline: none;
      transition: border-color 0.2s;
      width: 100%;
      box-sizing: border-box;
      min-height: 46px;
    `;
    input.onfocus = () => input.style.borderColor = '#00ff88';
    input.onblur = () => input.style.borderColor = '#333';
    return input;
  }

  private cleanupHTML(): void {
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
  }

  destroy(): void {
    this.cleanupHTML();
  }
}
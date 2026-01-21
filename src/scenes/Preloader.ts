import Phaser from 'phaser';

export class Preloader extends Phaser.Scene {
  constructor() {
    super('Preloader');
  }

  preload(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Create loading bar background
    const bgBar = this.add.graphics();
    bgBar.fillStyle(0x333333, 1);
    bgBar.fillRect(width / 4, height / 2 - 15, width / 2, 30);

    // Create loading bar
    const progressBar = this.add.graphics();

    // Loading text
    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      fontSize: '24px',
      color: '#ffffff',
    });
    loadingText.setOrigin(0.5);

    // Update progress bar
    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0x00ff88, 1);
      progressBar.fillRect(width / 4 + 5, height / 2 - 10, (width / 2 - 10) * value, 20);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      bgBar.destroy();
      loadingText.destroy();
    });

    // Generate placeholder assets programmatically
    this.createPlaceholderAssets();
  }

  createPlaceholderAssets(): void {
    // Create enemy sprite texture
    const enemyGraphics = this.make.graphics({ x: 0, y: 0 });
    enemyGraphics.fillStyle(0xff4444, 1);
    enemyGraphics.fillRoundedRect(0, 0, 80, 60, 10);
    enemyGraphics.generateTexture('enemy', 80, 60);
    enemyGraphics.destroy();

    // Create button texture
    const buttonGraphics = this.make.graphics({ x: 0, y: 0 });
    buttonGraphics.fillStyle(0x4488ff, 1);
    buttonGraphics.fillRoundedRect(0, 0, 70, 70, 12);
    buttonGraphics.generateTexture('button', 70, 70);
    buttonGraphics.destroy();

    // Create button pressed texture
    const buttonPressedGraphics = this.make.graphics({ x: 0, y: 0 });
    buttonPressedGraphics.fillStyle(0x66aaff, 1);
    buttonPressedGraphics.fillRoundedRect(0, 0, 70, 70, 12);
    buttonPressedGraphics.generateTexture('button_pressed', 70, 70);
    buttonPressedGraphics.destroy();

    // Create explosion particles
    const particleGraphics = this.make.graphics({ x: 0, y: 0 });
    particleGraphics.fillStyle(0xffaa00, 1);
    particleGraphics.fillCircle(8, 8, 8);
    particleGraphics.generateTexture('particle', 16, 16);
    particleGraphics.destroy();
  }

  create(): void {
    this.scene.start('AuthScene');
  }
}

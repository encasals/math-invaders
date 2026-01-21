import Phaser from 'phaser';

export class Boot extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload(): void {
    // Load minimal assets needed for the preloader
    // For now, we'll use graphics-based loading
  }

  create(): void {
    // Set up game settings
    this.scale.on('resize', this.resize, this);
    
    // Move to the preloader scene
    this.scene.start('Preloader');
  }

  resize(gameSize: Phaser.Structs.Size): void {
    const width = gameSize.width;
    const height = gameSize.height;

    this.cameras.resize(width, height);
  }
}

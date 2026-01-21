import Phaser from 'phaser';

export class Enemy extends Phaser.GameObjects.Container {
  public targetValue: number;
  declare public body: Phaser.Physics.Arcade.Body;
  private background: Phaser.GameObjects.Graphics;
  private valueText: Phaser.GameObjects.Text;
  private speed: number;

  constructor(scene: Phaser.Scene, x: number, y: number, value: number, speed: number) {
    super(scene, x, y);

    this.targetValue = value;
    this.speed = speed;

    // Create background - Space Invaders green
    this.background = scene.add.graphics();
    this.background.fillStyle(0x00ff00, 1);
    this.background.fillRoundedRect(-40, -30, 80, 60, 10);
    this.background.lineStyle(2, 0x88ff88, 0.9);
    this.background.strokeRoundedRect(-40, -30, 80, 60, 10);
    this.add(this.background);

    // Create value text - dark for contrast on green
    this.valueText = scene.add.text(0, 0, value.toString(), {
      fontSize: '32px',
      color: '#003300',
      fontStyle: 'bold',
    });
    this.valueText.setOrigin(0.5);
    this.add(this.valueText);

    // Add to scene and enable physics
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Set up physics body
    this.body.setSize(80, 60);
    this.body.setOffset(-40, -30);
    this.body.setVelocityY(this.speed);
  }

  destroy(fromScene?: boolean): void {
    this.background.destroy();
    this.valueText.destroy();
    super.destroy(fromScene);
  }

  explode(): void {
    // Create explosion effect
    const particles = this.scene.add.particles(this.x, this.y, 'particle', {
      speed: { min: 100, max: 200 },
      scale: { start: 1, end: 0 },
      lifespan: 500,
      quantity: 20,
      blendMode: 'ADD',
    });

    // Stop emitting after burst
    this.scene.time.delayedCall(100, () => {
      particles.stop();
    });

    // Clean up particles after animation
    this.scene.time.delayedCall(600, () => {
      particles.destroy();
    });

    // Flash effect - green for Space Invaders style
    this.scene.cameras.main.flash(100, 0, 255, 136, false);

    this.destroy();
  }
}

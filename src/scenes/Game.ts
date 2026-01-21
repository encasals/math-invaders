import Phaser from 'phaser';
import { Enemy } from '../objects/Enemy';
import { Keypad } from '../objects/Keypad';
import { AuthService } from '../firebase/authService';

export class Game extends Phaser.Scene {
  private authService: AuthService;
  private enemies: Enemy[] = [];
  private keypad!: Keypad;
  private score: number = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private spawnTimer!: Phaser.Time.TimerEvent;
  private floorY: number = 0;
  private gameWidth: number = 0;
  private difficultyLevel: number = 1;
  private enemiesDestroyed: number = 0;
  private gameOverCalled: boolean = false;

  // Keypad values - 8 numbers for variety
  private readonly keypadValues = [1, 2, 3, 5, 7, 10, 15, 20];

  constructor() {
    super('Game');
    this.authService = AuthService.getInstance();
  }

  create(): void {
    this.gameWidth = this.cameras.main.width;
    const gameHeight = this.cameras.main.height;

    // Reset game state
    this.enemies = [];
    this.score = 0;
    this.difficultyLevel = 1;
    this.enemiesDestroyed = 0;
    this.gameOverCalled = false;

    // Calculate floor position (above keypad area)
    const keypadHeight = 280;
    this.floorY = gameHeight - keypadHeight;

    // Create floor line (visual indicator) - Space Invaders green
    const floorLine = this.add.graphics();
    floorLine.lineStyle(3, 0x00ff00, 0.8);
    floorLine.lineBetween(0, this.floorY, this.gameWidth, this.floorY);

    // Add danger zone gradient - green theme
    const dangerZone = this.add.graphics();
    dangerZone.fillGradientStyle(0x00ff00, 0x00ff00, 0x00ff00, 0x00ff00, 0.3, 0, 0.3, 0);
    dangerZone.fillRect(0, this.floorY - 60, this.gameWidth, 60);

    // Create score display
    this.scoreText = this.add.text(20, 20, 'Score: 0', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold',
    });

    // Create level display
    this.add.text(this.gameWidth - 20, 20, '', {
      fontSize: '18px',
      color: '#aaaaaa',
    }).setOrigin(1, 0);

    // Create keypad at the bottom
    this.keypad = new Keypad(this, this.gameWidth / 2, gameHeight - 130, {
      values: this.keypadValues,
      onValueSelected: this.onNumberSelected.bind(this),
    });

    // Start spawning enemies
    this.startSpawning();

    // Update difficulty over time
    this.time.addEvent({
      delay: 15000, // Every 15 seconds
      callback: this.increaseDifficulty,
      callbackScope: this,
      loop: true,
    });
  }

  private startSpawning(): void {
    // Clear existing timer
    if (this.spawnTimer) {
      this.spawnTimer.destroy();
    }

    // Spawn rate based on difficulty
    const spawnDelay = Math.max(1500, 3000 - this.difficultyLevel * 200);

    this.spawnTimer = this.time.addEvent({
      delay: spawnDelay,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true,
    });

    // Spawn first enemy immediately
    this.spawnEnemy();
  }

  private spawnEnemy(): void {
    // Generate target value based on available keypad numbers
    const targetValue = this.generateTargetValue();

    // Random X position with margin
    const margin = 60;
    const x = Phaser.Math.Between(margin, this.gameWidth - margin);

    // Speed based on difficulty
    const baseSpeed = 30;
    const speedVariation = 20;
    const speed = baseSpeed + this.difficultyLevel * 10 + Phaser.Math.Between(-speedVariation, speedVariation);

    const enemy = new Enemy(this, x, -40, targetValue, speed);
    this.enemies.push(enemy);
  }

  private generateTargetValue(): number {
    // Generate sums that are achievable with the keypad values
    // Pick 1-4 random values from the keypad and sum them
    const numValues = Phaser.Math.Between(1, Math.min(4, 1 + Math.floor(this.difficultyLevel / 2)));
    let sum = 0;

    for (let i = 0; i < numValues; i++) {
      const randomValue = Phaser.Utils.Array.GetRandom(this.keypadValues);
      sum += randomValue;
    }

    // Clamp to reasonable range
    return Math.min(sum, 99);
  }

  private onNumberSelected(_value: number): void {
    const currentSum = this.keypad.getCurrentSum();

    // Check for matches with any enemy
    const matchingEnemy = this.findClosestMatchingEnemy(currentSum);

    if (matchingEnemy) {
      // Match found - destroy enemy
      this.destroyEnemy(matchingEnemy);
      this.keypad.flashSuccess();
      this.keypad.resetSum();
      return;
    }

    // Check for overshoot (sum is greater than all active enemies)
    if (this.isOvershoot(currentSum)) {
      this.keypad.flashError();
      this.keypad.resetSum();
      this.cameras.main.shake(100, 0.01);
    }
  }

  private findClosestMatchingEnemy(sum: number): Enemy | null {
    let closestEnemy: Enemy | null = null;
    let closestDistance = Infinity;

    for (const enemy of this.enemies) {
      if (enemy.targetValue === sum) {
        const distance = this.floorY - enemy.y;
        if (distance < closestDistance) {
          closestDistance = distance;
          closestEnemy = enemy;
        }
      }
    }

    return closestEnemy;
  }

  private isOvershoot(sum: number): boolean {
    // Check if sum is greater than all active enemy values
    if (this.enemies.length === 0) return sum > 0;

    for (const enemy of this.enemies) {
      if (sum <= enemy.targetValue) {
        return false;
      }
    }

    return true;
  }

  private destroyEnemy(enemy: Enemy): void {
    // Update score
    const points = enemy.targetValue * 10;
    this.score += points;
    this.scoreText.setText(`Score: ${this.score}`);

    // Show floating score
    const floatingScore = this.add.text(enemy.x, enemy.y, `+${points}`, {
      fontSize: '24px',
      color: '#00ff88',
      fontStyle: 'bold',
    });
    floatingScore.setOrigin(0.5);

    this.tweens.add({
      targets: floatingScore,
      y: enemy.y - 50,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => floatingScore.destroy(),
    });

    // Remove from array
    const index = this.enemies.indexOf(enemy);
    if (index > -1) {
      this.enemies.splice(index, 1);
    }

    // Explode enemy
    enemy.explode();

    // Track for difficulty
    this.enemiesDestroyed++;
  }

  private increaseDifficulty(): void {
    this.difficultyLevel++;
    this.startSpawning();

    // Show level up notification
    const levelText = this.add.text(
      this.gameWidth / 2,
      this.cameras.main.height / 2 - 100,
      `Level ${this.difficultyLevel}!`,
      {
        fontSize: '36px',
        color: '#ffaa00',
        fontStyle: 'bold',
      }
    );
    levelText.setOrigin(0.5);

    this.tweens.add({
      targets: levelText,
      scale: { from: 0.5, to: 1.5 },
      alpha: { from: 1, to: 0 },
      duration: 1500,
      ease: 'Power2',
      onComplete: () => levelText.destroy(),
    });
  }

  update(): void {
    // Check for enemies reaching the floor
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];

      if (enemy.y >= this.floorY) {
        // Game over!
        if (!this.gameOverCalled) {
          this.gameOverCalled = true;
          this.gameOver();
        }
        return;
      }
    }
  }

  private async gameOver(): Promise<void> {
    // Stop spawning
    if (this.spawnTimer) {
      this.spawnTimer.destroy();
    }

    let isNewRecord = false;
    let previousScore = 0;

    // Save high score to Firebase if user is signed in
    if (this.authService.isSignedIn()) {
      try {
        const result = await this.authService.updateHighScore(this.score);
        isNewRecord = result.isNewRecord;
        previousScore = result.previousScore;
        
        if (isNewRecord) {
          console.log(`New high score! Previous: ${previousScore}, New: ${this.score}`);
          // Show new record notification
          this.showNewRecordNotification();
        } else {
          console.log(`Score saved. Current high score: ${previousScore}`);
        }
      } catch (error) {
        console.error('Error updating high score:', error);
      }
    } else {
      // Fallback to local storage for guests
      const currentHighScore = parseInt(localStorage.getItem('mathInvadersHighScore') || '0');
      if (this.score > currentHighScore) {
        localStorage.setItem('mathInvadersHighScore', this.score.toString());
        isNewRecord = true;
        previousScore = currentHighScore;
        this.showNewRecordNotification();
      }
    }

    // Flash screen red (with safety check)
    if (this.cameras && this.cameras.main) {
      this.cameras.main.flash(500, 255, 0, 0);
    }

    // Transition to game over scene with record info
    if (this.time && this.scene) {
      this.time.delayedCall(isNewRecord ? 1500 : 500, () => {
        this.scene.start('GameOver', { 
          score: this.score, 
          isNewRecord, 
          previousScore 
        });
      });
    }
  }

  private showNewRecordNotification(): void {
    // Safety check to ensure scene is still active
    if (!this.scene || !this.scene.isActive() || !this.add || !this.cameras) {
      return;
    }

    const recordText = this.add.text(
      this.gameWidth / 2,
      this.cameras.main.height / 2,
      'NEW HIGH SCORE!',
      {
        fontSize: '48px',
        color: '#ffaa00',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4
      }
    );
    recordText.setOrigin(0.5);

    // Add sparkle effect (with safety check)
    if (this.tweens) {
      this.tweens.add({
        targets: recordText,
        scale: { from: 0.5, to: 1.2 },
        alpha: { from: 0, to: 1 },
        duration: 500,
        ease: 'Back.easeOut',
        yoyo: true,
        repeat: 1,
        onComplete: () => {
          if (recordText && recordText.destroy) {
            recordText.destroy();
          }
        },
      });
    }

    // Flash screen gold for new record (with safety check)
    if (this.cameras && this.cameras.main) {
      this.cameras.main.flash(200, 255, 215, 0, false);
    }
  }
}

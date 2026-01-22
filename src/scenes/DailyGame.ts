import Phaser from 'phaser';
import { Enemy } from '../objects/Enemy';
import { Keypad } from '../objects/Keypad';
import {
  getDailyConfig,
  generateDailyEnemyValue,
  getDailyChallengeDescription,
  saveDailyChallengeScore,
  getDailyChallengeHighScore,
  DailyConfig,
  OperationType,
} from '../utils/DailyChallenge';

export class DailyGame extends Phaser.Scene {
  private enemies: Enemy[] = [];
  private keypad!: Keypad;
  private score: number = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private challengeInfoText!: Phaser.GameObjects.Text;
  private dailyHighScore: number = 0;
  private spawnTimer!: Phaser.Time.TimerEvent;
  private floorY: number = 0;
  private gameWidth: number = 0;
  private difficultyLevel: number = 1;
  private enemiesDestroyed: number = 0;
  private gameOverCalled: boolean = false;

  // Daily challenge config
  private dailyConfig!: DailyConfig;

  // Keypad values - 8 numbers for variety
  private readonly keypadValues = [1, 2, 3, 5, 7, 10, 15, 20];

  constructor() {
    super('DailyGame');
  }

  async create(): Promise<void> {
    this.gameWidth = this.cameras.main.width;
    const gameHeight = this.cameras.main.height;

    // Get daily challenge configuration
    this.dailyConfig = getDailyConfig();
    this.dailyHighScore = getDailyChallengeHighScore();

    // Reset game state
    this.enemies = [];
    this.score = 0;
    this.difficultyLevel = 1;
    this.enemiesDestroyed = 0;
    this.gameOverCalled = false;

    // Calculate floor position (above keypad area)
    const keypadHeight = 280;
    this.floorY = gameHeight - keypadHeight;

    // Create floor line (visual indicator) - Orange for daily challenge
    const floorLine = this.add.graphics();
    floorLine.lineStyle(3, 0xff8800, 0.8);
    floorLine.lineBetween(0, this.floorY, this.gameWidth, this.floorY);

    // Add danger zone gradient - orange theme for daily
    const dangerZone = this.add.graphics();
    dangerZone.fillGradientStyle(0xff8800, 0xff8800, 0xff8800, 0xff8800, 0.3, 0, 0.3, 0);
    dangerZone.fillRect(0, this.floorY - 60, this.gameWidth, 60);

    // Create daily challenge info display at top
    const challengeDesc = getDailyChallengeDescription(this.dailyConfig);
    this.challengeInfoText = this.add.text(this.gameWidth / 2, 15, `🎯 DAILY: ${challengeDesc}`, {
      fontSize: '18px',
      color: '#ff8800',
      fontStyle: 'bold',
    });
    this.challengeInfoText.setOrigin(0.5, 0);

    // Show the operation hint
    const operationHint = this.getOperationHint();
    const hintText = this.add.text(this.gameWidth / 2, 40, operationHint, {
      fontSize: '14px',
      color: '#aaaaaa',
    });
    hintText.setOrigin(0.5, 0);

    // Create score display
    this.scoreText = this.add.text(20, 65, 'Score: 0', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold',
    });

    // Create daily high score display below current score
    this.add.text(20, 95, `Today's Best: ${this.dailyHighScore}`, {
      fontSize: '18px',
      color: '#ff8800',
      fontStyle: 'bold',
    });

    // Create keypad at the bottom
    this.keypad = new Keypad(this, this.gameWidth / 2, gameHeight - 130, {
      values: this.keypadValues,
      onValueSelected: this.onNumberSelected.bind(this),
    });

    // Adjust for safe area on Android devices with on-screen navigation buttons
    const safeAreaPadding = 50;

    // Adjust keypad position to account for safe area
    this.keypad.setPosition(this.gameWidth / 2, gameHeight - 130 - safeAreaPadding);

    // Adjust danger zone position
    dangerZone.clear();
    dangerZone.fillGradientStyle(0xff8800, 0xff8800, 0xff8800, 0xff8800, 0.3, 0, 0.3, 0);
    dangerZone.fillRect(0, this.floorY - 60 - safeAreaPadding, this.gameWidth, 60);

    // Adjust floor line position
    floorLine.clear();
    floorLine.lineStyle(3, 0xff8800, 0.8);
    floorLine.lineBetween(0, this.floorY - safeAreaPadding, this.gameWidth, this.floorY - safeAreaPadding);

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

  private getOperationHint(): string {
    switch (this.dailyConfig.operation) {
      case OperationType.Addition:
        return `Find: ${this.dailyConfig.baseNumber} + ? = Enemy`;
      case OperationType.Subtraction:
        return `Find: Enemy - ${this.dailyConfig.baseNumber} = ?`;
      case OperationType.Multiplication:
        return `Find: ${this.dailyConfig.baseNumber} × ? = Enemy`;
      case OperationType.Division:
        return `Find: Enemy ÷ ${this.dailyConfig.baseNumber} = ?`;
    }
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
    // Generate target value using daily challenge logic
    const enemyData = generateDailyEnemyValue(this.dailyConfig, this.keypadValues);

    // Random X position with margin
    const margin = 60;
    const x = Phaser.Math.Between(margin, this.gameWidth - margin);

    // Speed based on difficulty
    const baseSpeed = 30;
    const speedVariation = 20;
    const speed = baseSpeed + this.difficultyLevel * 10 + Phaser.Math.Between(-speedVariation, speedVariation);

    // Create enemy with display value (what shows on screen)
    // but store target value (what player needs to input)
    const enemy = new DailyEnemy(this, x, -40, enemyData.displayValue, enemyData.targetValue, speed);
    this.enemies.push(enemy);
  }

  private onNumberSelected(_value: number): void {
    const currentSum = this.keypad.getCurrentSum();

    // Check for matches with any enemy (using targetValue for daily challenge)
    const matchingEnemy = this.findClosestMatchingEnemy(currentSum);

    if (matchingEnemy) {
      // Match found - destroy enemy
      this.destroyEnemy(matchingEnemy);
      this.keypad.flashSuccess();
      this.keypad.resetSum();
      return;
    }

    // Check for overshoot (sum is greater than all active enemies' target values)
    if (this.isOvershoot(currentSum)) {
      this.keypad.flashError();
      this.keypad.resetSum();
      this.cameras.main.shake(100, 0.01);
    }
  }

  private findClosestMatchingEnemy(sum: number): DailyEnemy | null {
    let closestEnemy: DailyEnemy | null = null;
    let closestDistance = Infinity;

    for (const enemy of this.enemies) {
      const dailyEnemy = enemy as DailyEnemy;
      if (dailyEnemy.targetValue === sum) {
        const distance = this.floorY - enemy.y;
        if (distance < closestDistance) {
          closestDistance = distance;
          closestEnemy = dailyEnemy;
        }
      }
    }

    return closestEnemy;
  }

  private isOvershoot(sum: number): boolean {
    // Check if sum is greater than all active enemy target values
    if (this.enemies.length === 0) return sum > 0;

    for (const enemy of this.enemies) {
      const dailyEnemy = enemy as DailyEnemy;
      if (sum <= dailyEnemy.targetValue) {
        return false;
      }
    }

    return true;
  }

  private destroyEnemy(enemy: DailyEnemy): void {
    // Update score - use display value for points (larger numbers = more points)
    const points = enemy.displayValue * 10;
    this.score += points;
    this.scoreText.setText(`Score: ${this.score}`);

    // Show floating score
    const floatingScore = this.add.text(enemy.x, enemy.y, `+${points}`, {
      fontSize: '24px',
      color: '#ff8800',
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
        color: '#ff8800',
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

    // Save daily challenge score
    const isNewRecord = saveDailyChallengeScore(this.score);
    const previousScore = this.dailyHighScore;

    if (isNewRecord) {
      this.showNewRecordNotification();
    }

    // Flash screen red (with safety check)
    if (this.cameras && this.cameras.main) {
      this.cameras.main.flash(500, 255, 0, 0);
    }

    // Transition to game over scene with daily challenge info
    if (this.time && this.scene) {
      this.time.delayedCall(isNewRecord ? 1500 : 500, () => {
        this.scene.start('GameOver', {
          score: this.score,
          isNewRecord,
          previousScore,
          isDaily: true,
          dailyOperation: getDailyChallengeDescription(this.dailyConfig),
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
      'NEW DAILY BEST!',
      {
        fontSize: '48px',
        color: '#ff8800',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4,
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

    // Flash screen orange for new daily record (with safety check)
    if (this.cameras && this.cameras.main) {
      this.cameras.main.flash(200, 255, 136, 0, false);
    }
  }
}

/**
 * Extended Enemy class for Daily Challenge that tracks both display and target values
 */
class DailyEnemy extends Enemy {
  public displayValue: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    displayValue: number,
    targetValue: number,
    speed: number
  ) {
    // Pass displayValue to parent for visual display
    super(scene, x, y, displayValue, speed);
    this.displayValue = displayValue;
    // Override targetValue for matching logic
    this.targetValue = targetValue;
  }
}

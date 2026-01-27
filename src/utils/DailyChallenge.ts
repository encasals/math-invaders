/**
 * Daily Challenge System
 * 
 * Generates deterministic daily challenge parameters based on the current UTC date.
 * All players get the same challenge on the same day worldwide.
 */

export enum OperationType {
  Addition = 0,
  Subtraction = 1,
  Multiplication = 2,
  Division = 3,
}

export interface DailyConfig {
  operation: OperationType;
  operationSymbol: string;
  baseNumber: number;
  seed: number;
  dateString: string;
}

/**
 * Simple seeded random number generator (Mulberry32)
 * Provides deterministic random numbers based on a seed
 */
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    let t = (this.seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min)) + min;
  }
}

/**
 * Generates a hash code from a string (similar to Java's hashCode)
 */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Gets the current UTC date string in YYYYMMDD format
 */
function getUTCDateString(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * Gets the operation symbol for display
 */
function getOperationSymbol(operation: OperationType): string {
  switch (operation) {
    case OperationType.Addition:
      return '+';
    case OperationType.Subtraction:
      return '−';
    case OperationType.Multiplication:
      return '×';
    case OperationType.Division:
      return '÷';
  }
}

/**
 * Generates the daily challenge configuration
 * This is deterministic - same date = same config worldwide
 */
export function getDailyConfig(): DailyConfig {
  const dateString = getUTCDateString();
  const seed = hashCode(dateString);
  const rng = new SeededRandom(seed);

  // Determine operation (0-3)
  const operation = rng.nextInt(0, 4) as OperationType;
  const operationSymbol = getOperationSymbol(operation);

  // Determine base number based on operation
  let baseNumber: number;
  switch (operation) {
    case OperationType.Addition:
    case OperationType.Subtraction:
      // Range: 10-50
      baseNumber = rng.nextInt(10, 51);
      break;
    case OperationType.Multiplication:
    case OperationType.Division:
      // Range: 2-9 (focus on times tables, exclude 0 and 1)
      baseNumber = rng.nextInt(2, 10);
      break;
  }

  return {
    operation,
    operationSymbol,
    baseNumber,
    seed,
    dateString,
  };
}

/**
 * Gets the number of keypad values to combine based on score
 */
function getNumValuesByScore(score: number): { min: number; max: number } {
  if (score >= 3000) {
    return { min: 2, max: 4 };
  } else if (score >= 1500) {
    return { min: 2, max: 4 };
  } else if (score >= 500) {
    return { min: 1, max: 3 };
  } else {
    return { min: 1, max: 2 };
  }
}

/**
 * Generates a target value by combining multiple keypad values
 */
function generateCombinedTarget(keypadValues: number[], score: number): number {
  const { min, max } = getNumValuesByScore(score);
  const numValues = Math.floor(Math.random() * (max - min + 1)) + min;
  
  let sum = 0;
  for (let i = 0; i < numValues; i++) {
    const randomValue = keypadValues[Math.floor(Math.random() * keypadValues.length)];
    sum += randomValue;
  }
  
  return sum;
}

/**
 * Generates an enemy value for the daily challenge based on operation type
 * Formula: baseNumber OP target = displayValue
 * The target value scales with score (more keypad numbers combined at higher scores)
 */
export function generateDailyEnemyValue(
  config: DailyConfig,
  keypadValues: number[],
  score: number = 0
): { displayValue: number; targetValue: number; equation: string } {
  // Generate target by combining multiple keypad values based on score
  let targetValue = generateCombinedTarget(keypadValues, score);

  switch (config.operation) {
    case OperationType.Addition: {
      // baseNumber + target = display
      const displayValue = config.baseNumber + targetValue;
      return {
        displayValue,
        targetValue,
        equation: `${config.baseNumber} + ? = ${displayValue}`,
      };
    }

    case OperationType.Subtraction: {
      // baseNumber - target = display
      // Ensure positive result: if target >= baseNumber, limit target
      if (targetValue >= config.baseNumber) {
        targetValue = Math.floor(Math.random() * (config.baseNumber - 1)) + 1;
      }
      const displayValue = config.baseNumber - targetValue;
      return {
        displayValue,
        targetValue,
        equation: `${config.baseNumber} - ? = ${displayValue}`,
      };
    }

    case OperationType.Multiplication: {
      // display × baseNumber = target (player finds target)
      // Ensure exact division: display = target / baseNumber
      // We need targetValue to be divisible by baseNumber
      targetValue = Math.ceil(targetValue / config.baseNumber) * config.baseNumber;
      if (targetValue === 0) targetValue = config.baseNumber;
      const displayValue = targetValue / config.baseNumber;
      return {
        displayValue,
        targetValue,
        equation: `${displayValue} × ${config.baseNumber} = ?`,
      };
    }

    case OperationType.Division: {
      // dividend ÷ baseNumber = target (player finds target)
      // Ensure exact division: dividend = baseNumber × target
      const dividend = config.baseNumber * targetValue;
      return {
        displayValue: dividend,
        targetValue,
        equation: `${dividend} ÷ ${config.baseNumber} = ?`,
      };
    }
  }
}

/**
 * Gets a human-readable description of today's challenge
 */
export function getDailyChallengeDescription(config: DailyConfig): string {
  switch (config.operation) {
    case OperationType.Addition:
      return `${config.baseNumber} + (? + ? + ...) = Enemy`;
    case OperationType.Subtraction:
      return `${config.baseNumber} - (? + ? + ...) = Enemy`;
    case OperationType.Multiplication:
      return `Enemy x ${config.baseNumber} = (? + ? + ...)`;
    case OperationType.Division:
      return `Enemy ÷ ${config.baseNumber} = (? + ? + ...)`;
  }
}

/**
 * Checks if the player has already completed today's challenge
 */
export function hasCompletedTodayChallenge(): boolean {
  const config = getDailyConfig();
  const lastCompleted = localStorage.getItem('dailyChallengeLastCompleted');
  return lastCompleted === config.dateString;
}

/**
 * Marks today's challenge as completed
 */
export function markDailyChallengeCompleted(): void {
  const config = getDailyConfig();
  localStorage.setItem('dailyChallengeLastCompleted', config.dateString);
}

/**
 * Gets the daily challenge high score
 */
export function getDailyChallengeHighScore(): number {
  const config = getDailyConfig();
  const key = `dailyChallengeScore_${config.dateString}`;
  return parseInt(localStorage.getItem(key) || '0', 10);
}

/**
 * Saves a daily challenge score (if it's a new high score for today)
 */
export function saveDailyChallengeScore(score: number): boolean {
  const config = getDailyConfig();
  const key = `dailyChallengeScore_${config.dateString}`;
  const currentHigh = parseInt(localStorage.getItem(key) || '0', 10);
  
  if (score > currentHigh) {
    localStorage.setItem(key, score.toString());
    markDailyChallengeCompleted();
    return true;
  }
  return false;
}

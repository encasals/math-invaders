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
 * Generates an enemy value for the daily challenge based on operation type
 */
export function generateDailyEnemyValue(
  config: DailyConfig,
  keypadValues: number[]
): { displayValue: number; targetValue: number; equation: string } {
  // Pick a random keypad value as the player's "input"
  const playerValue = keypadValues[Math.floor(Math.random() * keypadValues.length)];

  switch (config.operation) {
    case OperationType.Addition: {
      // Enemy shows: baseNumber + ? = X, player needs to find X
      // Display the sum, player taps the number that when added to base equals sum
      const sum = playerValue + config.baseNumber;
      return {
        displayValue: sum,
        targetValue: playerValue,
        equation: `${config.baseNumber} + ? = ${sum}`,
      };
    }

    case OperationType.Subtraction: {
      // Enemy shows: X - baseNumber = ?, player finds the result
      // Ensure no negative results
      const minuend = playerValue + config.baseNumber;
      return {
        displayValue: minuend,
        targetValue: playerValue,
        equation: `${minuend} - ${config.baseNumber} = ?`,
      };
    }

    case OperationType.Multiplication: {
      // Enemy shows: baseNumber × ? = X, player finds the multiplier
      const product = playerValue * config.baseNumber;
      return {
        displayValue: product,
        targetValue: playerValue,
        equation: `${config.baseNumber} × ? = ${product}`,
      };
    }

    case OperationType.Division: {
      // Enemy shows: X ÷ baseNumber = ?, player finds the quotient
      // Ensure exact division: dividend = baseNumber * playerValue
      const dividend = config.baseNumber * playerValue;
      return {
        displayValue: dividend,
        targetValue: playerValue,
        equation: `${dividend} ÷ ${config.baseNumber} = ?`,
      };
    }
  }
}

/**
 * Gets a human-readable description of today's challenge
 */
export function getDailyChallengeDescription(config: DailyConfig): string {
  const opNames = ['Addition', 'Subtraction', 'Multiplication', 'Division'];
  return `${opNames[config.operation]} with ${config.baseNumber}`;
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

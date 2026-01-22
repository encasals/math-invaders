# Math Invaders - Daily Challenge System

## 📘 Overview
This document describes the **Daily Challenge** mechanics for "Math Invaders," a Space Invaders-style game driven by mental arithmetic. 

The core feature is a daily level where the **mathematical operation** (Addition, Subtraction, Multiplication, Division) and the **base numbers** change every 24 hours. This logic is synchronized across all players using a deterministic algorithm based on the date.

---

## 🛠 Technical Architecture

To ensure low latency and cost-efficiency while maintaining global synchronization, the system uses a **Client-Side Deterministic Seed** approach.

### 1. Daily Seed Generation
Instead of fetching daily values from a server, the game generates them locally using the date as a "Seed".

* **Source:** Current Date in `YYYYMMDD` format.
* **Timezone:** **UTC** (Strict requirement to ensure global sync).
* **Algorithm:** 1. Get UTC Date string (e.g., `"20231027"`).
    2. Hash the string to an Integer.
    3. Use this Integer to initialize the Random Number Generator (RNG).

---

## 🧮 Game Logic & Rules

The RNG determines the **Operation Mode** for the day. Each mode has specific constraints to ensure the game is playable and fair.

### Operation Enums
| ID | Mode | Symbol | Difficulty |
| :--- | :--- | :--- | :--- |
| `0` | Addition | `+` | Low |
| `1` | Subtraction | `-` | Medium |
| `2` | Multiplication | `x` | High |
| `3` | Division | `÷` | Very High |

### Logic Constraints per Mode

#### A. Addition (`+`)
* **Formula:** `PlayerNumber + BaseNumber = EnemyNumber`
* **Base Range:** [10 - 50]
* **Constraints:** None.

#### B. Subtraction (`-`)
* **Formula:** `PlayerNumber - BaseNumber` OR `BaseNumber - PlayerNumber`
* **Base Range:** [10 - 50]
* **Critical Constraint:** **No Negative Results.** * *Implementation Detail:* When generating the equation, ensure the Minuend $\ge$ Subtrahend. If `A < B`, swap them.

#### C. Multiplication (`x`)
* **Formula:** `PlayerNumber * BaseNumber = EnemyNumber`
* **Base Range:** [2 - 9] (Focus on Times Tables).
* **Constraints:** Exclude 0 and 1 to prevent trivial gameplay.

#### D. Division (`÷`)
* **Formula:** `Dividend / Divisor = Quotient`
* **Range:** Divisor [2 - 9], Quotient [2 - 9].
* **Critical Constraint:** **Exact Integers Only.**
    * *Implementation Detail:* Do not generate random dividends directly.
    * **Step 1:** Generate a random `Divisor` (e.g., 4).
    * **Step 2:** Generate a random `Target_Quotient` (e.g., 6).
    * **Step 3:** Calculate `Dividend` = `Divisor` * `Target_Quotient` (4 * 6 = 24).
    * **Display:** Show `24 / 4`.

---

## 💻 Implementation Pseudocode (C# / JS Style)

Use this logic structure to implement the daily generator:

```csharp
void GenerateDailyLevel() {
    // 1. Get Date Seed (UTC)
    string dateString = DateTime.UtcNow.ToString("yyyyMMdd");
    int seed = dateString.GetHashCode();
    Random dailyRng = new Random(seed);

    // 2. Determine Operation
    OperationType opType = (OperationType)dailyRng.Next(0, 4); // 0 to 3

    // 3. Configure Level based on Operation
    switch (opType) {
        case OperationType.Addition:
            baseNumber = dailyRng.Next(10, 50);
            SetupUI("+", baseNumber);
            break;

        case OperationType.Subtraction:
            baseNumber = dailyRng.Next(10, 50);
            // Logic to ensure player input > baseNumber is handled in gameplay loop
            SetupUI("-", baseNumber);
            break;

        case OperationType.Multiplication:
            baseNumber = dailyRng.Next(2, 10);
            SetupUI("x", baseNumber);
            break;

        case OperationType.Division:
            int divisor = dailyRng.Next(2, 10);
            // In division mode, the base number might represent the divisor
            SetupUI("÷", divisor); 
            break;
    }
}
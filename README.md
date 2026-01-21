# Math Invaders - Mobile Web Game

## 1. Project Overview
**Math Invaders** is a mobile-first web game built with **Phaser 3**, **TypeScript**, and **Vite**. The game combines "Space Invaders" mechanics with rapid mental math. Instead of shooting bullets, the user must select numbers from a keypad to sum up to the value of the falling "Enemy Numbers" to destroy them.

This project is designed to be deployed as a **PWA (Progressive Web App)** on Vercel/Netlify.

## 2. Tech Stack & Architecture
* **Engine:** Phaser 3 (Arcade Physics).
* **Language:** TypeScript.
* **Bundler:** Vite.
* **Deployment:** Static hosting (Vercel/Netlify).
* **Responsiveness:** Full-screen canvas, scaled to fit mobile screens (`Phaser.Scale.FIT` or `RESIZE`).

## 3. Game Mechanics

### The Core Loop
1.  **Enemies (Falling Numbers):**
    * Numbers fall from the top of the screen at varying speeds.
    * Each enemy has a visual `Target Value` (e.g., 15, 20, 50).
2.  **Player Input (The Keypad):**
    * Located at the bottom of the screen (fixed UI).
    * Contains **8 selectable numbers** (e.g., 1, 2, 3, 4, 5, 10, etc.).
    * When tapped, the button highlights, and its value is added to the `Current Sum`.
3.  **The "Shooting" Logic:**
    * **Match:** If `Current Sum` == `Enemy Target Value` -> The closest enemy with that value is destroyed (explosion effect) and score increases. The `Current Sum` resets to 0.
    * **Overshoot:** If `Current Sum` > `Enemy Target Value` (checked against all active enemies) -> The `Current Sum` resets to 0 instantly, and visual feedback (red flash) indicates an error.
4.  **Win/Loss:**
    * **Game Over:** If an enemy touches the "floor" (just above the keypad).

## 4. Project Structure
The AI should generate the following file structure:

```text
/
├── public/
│   ├── assets/          # Placeholders for sprites/sounds
│   ├── manifest.json    # PWA Configuration
│   └── icons/           # App icons
├── src/
│   ├── scenes/
│   │   ├── Boot.ts      # Preload settings & screen scaling
│   │   ├── Preloader.ts # Asset loading
│   │   ├── MainMenu.ts  # Start button
│   │   ├── Game.ts      # Main game logic (Spawner, Math logic)
│   │   └── GameOver.ts  # Score display & Restart
│   ├── objects/
│   │   ├── Enemy.ts     # Class for the falling number
│   │   └── Keypad.ts    # Class for the UI buttons
│   ├── main.ts          # Phaser Game Config
│   └── style.css        # CSS to remove margins/padding for full screen
├── index.html
├── package.json
└── tsconfig.json
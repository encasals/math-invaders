# Math Invaders - Development

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── main.ts          # Phaser game configuration
├── style.css        # Full-screen CSS
├── scenes/
│   ├── Boot.ts      # Screen scaling setup
│   ├── Preloader.ts # Asset loading
│   ├── MainMenu.ts  # Start screen
│   ├── Game.ts      # Main game logic
│   └── GameOver.ts  # Score display & restart
└── objects/
    ├── Enemy.ts     # Falling number class
    └── Keypad.ts    # UI buttons class
```

## Game Mechanics

- Numbers fall from the top of the screen
- Tap keypad buttons to add values to your sum
- When your sum matches an enemy's value, it's destroyed!
- If your sum exceeds all enemy values, it resets (overshoot)
- Don't let enemies reach the bottom!

## PWA Support

The game is configured as a Progressive Web App and can be installed on mobile devices.

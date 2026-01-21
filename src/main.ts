import Phaser from 'phaser';
import './pwa-install.js';
import { Boot } from './scenes/Boot';
import { Preloader } from './scenes/Preloader';
import { AuthScene } from './scenes/AuthScene';
import { MainMenu } from './scenes/MainMenu';
import { ProfileScene } from './scenes/ProfileScene';
import { HighScoresScene } from './scenes/HighScoresScene';
import { HowToPlayScene } from './scenes/HowToPlayScene';
import { Game } from './scenes/Game';
import { GameOver } from './scenes/GameOver';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  backgroundColor: '#1a1a2e',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: '100%',
    height: '100%',
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [Boot, Preloader, AuthScene, MainMenu, ProfileScene, HighScoresScene, HowToPlayScene, Game, GameOver],
};

const game = new Phaser.Game(config);

export default game;

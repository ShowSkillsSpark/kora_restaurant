import { AUTO, Game, Scale, Types } from "phaser";

import { Preloader } from "./scenes/Preloader";
import { MainMenu } from "./scenes/MainMenu";
import { MainGame } from "./scenes/MainGame";
import { GameOver } from "./scenes/GameOver";
import { Boot } from "./scenes/Boot";
import { Recipe } from "./scenes/Recipe";
import { Credits } from "./scenes/Credits";
import { HEIGHT, WIDTH } from "./constants";

const config: Types.Core.GameConfig = {
    type: AUTO,
    parent: "game-container",
    width: WIDTH,
    height: HEIGHT,
    // backgroundColor: "#000000",
    backgroundColor: "#ffe8ee",
    // pixelArt: true,
    // roundPixel: false,
    scale: {
        mode: Scale.FIT,
        autoCenter: Scale.CENTER_BOTH,
    },
    // physics: {
    //     default: "arcade",
    //     arcade: {
    //         gravity: { y: 0 }
    //     }
    // },
    scene: [
        Boot,
        Preloader,
        MainMenu,
        MainGame,
        Recipe,
        Credits,
        GameOver,
    ],
};

let game: Game;
document.addEventListener("DOMContentLoaded", () => {
    game = new Game(config);
    // game.scale.on('orientationchange', () => {
    //     game.scale.scaleMode = Scale.FIT
    // });
});
// window.addEventListener('deviceorientation', () => {
// });
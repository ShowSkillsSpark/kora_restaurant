import { Scene } from "phaser";
import { MainGame } from "./MainGame";
import { MainMenu } from "./MainMenu";
import { HEIGHT, WIDTH } from "../constants";
import { GameOver } from "./GameOver";

export class Preloader extends Scene {
    constructor() {
        super('Preloader');
    }

    init() {
        this.add.rectangle(WIDTH/2, HEIGHT/2, WIDTH/2, HEIGHT/32).setStrokeStyle(1, 0x575876);
        const bar = this.add.rectangle(WIDTH/4, HEIGHT/2, 0, HEIGHT/32, 0x575876);
        this.load.on('progress', (progress: number) => {
            bar.width = WIDTH/2 * progress;
        });
    }

    preload() {
        // 뒤에 모든 씬에 필요한 파일 전부 불러오기
        this.load.font('Jalnan', 'https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_four@1.2/JalnanOTF00.woff');
        this.load.font('StudyHard', 'https://fastly.jsdelivr.net/gh/projectnoonnu/2411-3@1.0/Ownglyph_StudyHard-Rg.woff2');
        this.load.font('ChosunGs', 'https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_20-04@1.0/ChosunGs.woff');
        this.load.font('NoonnuBasicGothicRegular', 'https://fastly.jsdelivr.net/gh/projectnoonnu/noon-2410@1.0/NoonnuBasicGothicRegular.woff2');

        MainMenu.preload(this);
        MainGame.preload(this);
        GameOver.preload(this);
    }
    create() {
        this.scene.start('MainMenu');
    }
}
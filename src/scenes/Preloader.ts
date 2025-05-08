import { Scene } from "phaser";
import { Order } from "./MainGame";

export class Preloader extends Scene {
    constructor() {
        super('Preloader');
    }

    init() {
        this.add.rectangle(600, 450, 600, 40).setStrokeStyle(1, 0xffffff);
        const bar = this.add.rectangle(600 - 298, 450, 4, 36, 0xffffff);
        this.load.on('progress', (progress: number) => {
            bar.width = 4 + 592 * progress;
        });
    }

    preload() {
        // 뒤에 모든 씬에 필요한 파일 전부 불러오기
        this.load.font('Jalnan', 'https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_four@1.2/JalnanOTF00.woff');
        this.load.font('StudyHard', 'https://fastly.jsdelivr.net/gh/projectnoonnu/2411-3@1.0/Ownglyph_StudyHard-Rg.woff2');
        Order.preload(this);
    }
    create() {
        this.scene.start('MainMenu');
    }
}
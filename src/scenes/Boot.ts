import { Scene } from "phaser";

export class Boot extends Scene {
    constructor() {
        super("Boot");
    }

    preload() {
        // Preload 씬에 필요한 파일 불러오기
    }

    create() {
        this.scene.start("Preloader");
    }
}
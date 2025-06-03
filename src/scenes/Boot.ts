import { Scale, Scene } from "phaser";

export class Boot extends Scene {
    constructor() {
        super("Boot");
    }

    preload() {
        // Preload 씬에 필요한 파일 불러오기
    }

    create() {
        console.log('억까 신고는 https://cafe.naver.com/virtualidol/3773 에 댓글로 부탁드립니다.');
        this.scene.start("Preloader");
    }
}
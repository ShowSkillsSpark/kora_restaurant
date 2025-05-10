import { Scene } from "phaser";
import { HEIGHT, WIDTH } from "../constants";

export class Recipe extends Scene {
    constructor() {
        super("Recipe");
    }

    create() {
        this.add.text(0, 0, `코라떡볶이: 냄비 + 물 + 떡 + 특제소스 [+ 어묵] [+ 파]\n쟈코라면: 냄비 + 물 + 면 + 라면스프 [+ 계란] [+ 참깨]\n난데순대: 찜기 + 물 + 순대\n대두왕만두: 찜기 + 물 + 만두\n수돗물: 컵 + 물\n우루사이다: 컵 + 사이다\n코라콜라: 컵 + 콜라\n`, {
            fontSize: HEIGHT / 16,
            color: '#000000',
            fontFamily: 'StudyHard',
        });
        // 돌아가기
        const back_text = this.add.text(WIDTH / 2, 3 * HEIGHT/4, '돌아가기', {
            fontSize: HEIGHT / 8,
            color: '#ff0000',
            fontFamily: 'StudyHard',
        }).setOrigin(0.5);

        back_text.setInteractive();
        back_text.on('pointerup', () => {
            this.scene.start('MainMenu');
        });
        back_text.on('pointerover', () => {
            this.scene.scene.tweens.add({
                targets: back_text,
                scale: 1.1,
                duration: 100,
            });
        });
        back_text.on('pointerout', () => {
            this.scene.scene.tweens.add({
                targets: back_text,
                scale: 1,
                duration: 100,
            });
        });
    }
}
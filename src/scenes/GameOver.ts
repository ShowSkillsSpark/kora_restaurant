import { Scene } from "phaser";
import { HEIGHT, WIDTH } from "../constants";

export class GameOver extends Scene {
    constructor() {
        super("GameOver");
    }

    create() {
        // 점수
        const earn_text = (sessionStorage.getItem('earn') || '0').replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' 치즈'
        this.add.text(WIDTH / 2, 1 * HEIGHT/4, '최종점수: ' + earn_text, {
            fontSize: HEIGHT / 4,
            color: '#ffffff',
            fontFamily: 'StudyHard',
            stroke: '#000000',
            strokeThickness: 4,
        }).setOrigin(0.5);
        // 돌아가기
        const back_text = this.add.text(WIDTH / 2, 3 * HEIGHT/4, '돌아가기', {
            fontSize: HEIGHT / 8,
            color: '#ff0000',
            fontFamily: 'StudyHard',
        }).setOrigin(0.5);

        back_text.setInteractive();
        back_text.on('pointerdown', () => {
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
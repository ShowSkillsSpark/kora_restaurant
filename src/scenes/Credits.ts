import { Scene } from "phaser";
import { HEIGHT, WIDTH } from "../constants";

export class Credits extends Scene {
    constructor() {
        super("Credits");
    }

    create() {
        this.add.text(WIDTH / 2, HEIGHT/16, '기획/개발', {
            fontSize: HEIGHT / 16,
            color: '#000000',
            fontFamily: 'StudyHard',
        }).setOrigin(0.5);
        this.add.text(WIDTH / 2, 3 * HEIGHT/16, '실력발휘', {
            fontSize: HEIGHT / 8,
            color: '#000000',
            fontFamily: 'StudyHard',
        }).setOrigin(0.5);

        this.add.text(WIDTH / 2, 6 * HEIGHT/16, '효과음 제공', {
            fontSize: HEIGHT / 16,
            color: '#000000',
            fontFamily: 'StudyHard',
        }).setOrigin(0.5);
        this.add.text(WIDTH / 2, 8 * HEIGHT/16, '피디님', {
            fontSize: HEIGHT / 8,
            color: '#000000',
            fontFamily: 'StudyHard',
        }).setOrigin(0.5);
        
        // 돌아가기
        const back_text = this.add.text(WIDTH / 2, 3 * HEIGHT/4, '돌아가기', {
            fontSize: HEIGHT / 8,
            color: '#ff0000',
            fontFamily: 'StudyHard',
        }).setOrigin(0.5);

        back_text.setInteractive();
        back_text.on('pointerup', () => {
            this.sound.play('tap1', {volume: 0.4});
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
import { Scene } from "phaser";
import { HEIGHT, WIDTH } from "../constants";

export class GameOver extends Scene {
    constructor() {
        super("GameOver");
    }

    create() {
        const tap_water_only_flag = sessionStorage.getItem('tap_water_only_flag') === 'true';

        // 스크린샷
        const screenshot_btn = this.add.text(0, 0, ' 찰칵! ', {
            fontSize: HEIGHT / 20,
            color: '#ffffff',
            fontFamily: 'StudyHard',
            stroke: '#000000',
            strokeThickness: 2,
        }).setOrigin(0, 0).setInteractive();
        screenshot_btn.on('pointerup', () => {
            const uri = this.game.canvas.toDataURL('image/png');
            const name = 'kora_restaurant_' + Date.now() + '.png';
            const a_element = document.createElement('a')
            a_element.download = name;
            a_element.href = uri;
            a_element.click();
            this.sound.play('screenshot', {volume: 0.4});
        });
        screenshot_btn.on('pointerover', () => {
            this.scene.scene.tweens.add({
                targets: screenshot_btn,
                scale: 0.8,
                duration: 50,
            });
        });
        screenshot_btn.on('pointerout', () => {
            this.scene.scene.tweens.add({
                targets: screenshot_btn,
                scale: 1,
                duration: 50,
            });
        });

        // 점수
        const earn = sessionStorage.getItem('earn') || '0';
        const earn_text = earn.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' 치즈';
        const text = this.add.text(WIDTH / 2, 1 * HEIGHT/4, '최종점수: ' + earn_text, {
            fontSize: HEIGHT / 5,
            color: tap_water_only_flag ? '#ffffcc' : '#ffffff',
            fontFamily: 'StudyHard',
            stroke: '#000000',
            strokeThickness: 4,
        }).setOrigin(0.5);
        this.add.tween({
            targets: text,
            scale: 1.05,
            duration: 800,
            repeat: -1,
            yoyo: true,
        });

        // 최고점수
        if (tap_water_only_flag) {
            const high_score_tap = localStorage.getItem('high_score_tap') || '0';
            localStorage.setItem('high_score_tap', (parseInt(high_score_tap) > parseInt(earn)) ? high_score_tap : earn);
            // console.log(high_score_tap, earn, parseInt(high_score_tap), parseInt(earn));
        } else {
            const high_score = localStorage.getItem('high_score') || '0';
            localStorage.setItem('high_score', (parseInt(high_score) > parseInt(earn)) ? high_score : earn);
            // console.log(high_score, earn, parseInt(high_score), parseInt(earn));
        }

        // 돌아가기
        const back_text = this.add.text(WIDTH / 2, 3 * HEIGHT/4, '돌아가기', {
            fontSize: HEIGHT / 8,
            color: '#ff0000',
            fontFamily: 'StudyHard',
        }).setOrigin(0.5);
        back_text.visible = false;

        this.time.addEvent({
            delay: 1500,
            callback: () => {
                back_text.visible = true;
                back_text.setInteractive();
            },
            loop: false,
        });
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

        this.sound.getAllPlaying().forEach((sound) => {
            sound.stop();
        });
        const earn_number = parseInt(earn);
        if (earn_number < 5000) {
            this.sound.play('score_05', {volume: 0.7});
        } else if (earn_number < 10000) {
            this.sound.play('score_10', {volume: 0.7});
        } else if (earn_number < 15000) {
            this.sound.play('score_15', {volume: 0.7});
        } else if (earn_number < 20000) {
            this.sound.play('score_20', {volume: 0.7});
        } else if (earn_number < 25000) {
            this.sound.play('score_25', {volume: 0.7});
        } else if (earn_number < 30000) {
            this.sound.play('score_30', {volume: 0.7});
        } else if (earn_number < 35000) {
            this.sound.play('score_35', {volume: 0.7});
        } else if (earn_number < 100000){
            this.sound.play('score_40', {volume: 0.7});
        } else {
            this.sound.play('score_100', {volume: 0.7});
        }
        this.sound.play('GameOver_bgm_' + Math.floor(Math.random() * 4), {volume: 0.3});
    }

    static preload(scene: Scene) {
        scene.load.setPath('assets/GameOver');
        scene.load.audio('score_05', 'voice_6.wav');
        scene.load.audio('score_10', 'voice_0.wav');
        scene.load.audio('score_15', 'voice_1.wav');
        scene.load.audio('score_20', 'voice_4.wav');
        scene.load.audio('score_25', 'voice_10.wav');
        scene.load.audio('score_30', 'voice_8.wav');
        scene.load.audio('score_35', 'voice_2.wav');
        scene.load.audio('score_40', 'voice_3.wav');
        scene.load.audio('score_100', 'voice_11.wav');
        scene.load.audio('GameOver_bgm_0', 'Carpe Diem.mp3');
        scene.load.audio('GameOver_bgm_1', 'Flying Kerfuffle.mp3');
        scene.load.audio('GameOver_bgm_2', 'Carefree.mp3');
        scene.load.audio('GameOver_bgm_3', 'Pixel Peeker Polka - faster.mp3');
        scene.load.audio('screenshot', 'camera-13695.mp3');
    }
}

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

        this.sound.getAllPlaying().forEach((sound) => {
            sound.stop();
        });
        const earn_number = parseInt(earn);
        // const earn_number = 200000;
        let back_text_delay = 1500;
        if (earn_number < 5000) {
            this.sound.play('score_05', {volume: 0.7});
            const crying_rei = this.add.image(WIDTH, HEIGHT*1.5, 'crying_rei').setOrigin(1).setScale(1.4).setToBack();
            this.add.tween({
                targets : crying_rei,
                ease: 'Bounce',
                duration: 800,
                props: {
                    y: HEIGHT*1,
                },
            });
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
        } else if (earn_number < 131600) {
            const x_offset = -WIDTH;
            const rei = this.add.image(x_offset, HEIGHT*1.6, 'victory_rei').setOrigin(0.5, 1).setScale(1).setToBack();
            this.add.tween({
                targets: rei,
                yoyo: true,
                delay: 3300,
                duration: 1000,
                angle: 7,
                ease: 'Back',
            });
            this.add.tween({
                targets: rei,
                duration: 1000,
                ease: 'Cubic',
                props: {
                    x: {
                        value: WIDTH/8,
                    }
                },
            });
            this.add.tween({
                targets: rei,
                delay: 5000,
                duration: 500,
                ease: 'Cubic',
                props: {
                    y: {
                        value: HEIGHT*1.4,
                    }
                },
                yoyo: true,
                repeat: -1,
            });
            this.sound.play('score_100', {volume: 0.7});
        } else {
            const x_offset = WIDTH/8;
            const y_offset = HEIGHT*0.9;
            const arm = this.add.image(x_offset, y_offset, 'moe_rei_arm').setOrigin(0.5).setScale(1.2).setToBack();
            const body = this.add.image(x_offset, y_offset, 'moe_rei_body').setOrigin(0.5).setScale(1.2).setToBack();
            this.add.tween({
                targets: [arm, body],
                yoyo: true,
                duration: 1500,
                repeatDelay: 1000,
                angle: -2,
                scaleX: 0.5,
                scaleY: 0.5,
                ease: 'Cubic',
            });
            this.add.tween({
                targets: [arm, body],
                yoyo: true,
                delay: 3200,
                duration: 300,
                props: {
                    x: {
                        value: WIDTH/3,
                    },
                },
                ease: 'Back',
            });
            const jump_delay = 180;
            this.add.tween({
                targets: [arm, body],
                yoyo: true,
                delay: 5000,
                duration: 500,
                repeatDelay: jump_delay,
                repeat: -1,
                angle: 2,
                props: {
                    y: {
                        value: y_offset - HEIGHT/4,
                    },
                },
                ease: 'Cubic',
            });
            this.add.tween({
                targets: [arm],
                yoyo: true,
                delay: 5000,
                duration: 500,
                repeatDelay: jump_delay,
                repeat: -1,
                props: {
                    x: {
                        value: x_offset + WIDTH/10,
                    },
                    y: {
                        value: y_offset - HEIGHT/4 + HEIGHT/20,
                    },
                },
                ease: 'Cubic',
            });
            this.add.tween({
                targets: [arm],
                yoyo: true,
                delay: 5000,
                duration: 500,
                repeatDelay: jump_delay,
                repeat: -1,
                angle: 10,
                ease: 'Cubic',
            });
            this.add.tween({
                targets: [body],
                yoyo: true,
                delay: 5000,
                duration: 500,
                repeatDelay: jump_delay,
                repeat: -1,
                angle: -5,
                ease: 'Cubic',
            });

            const cat = this.add.image(WIDTH*14/16, HEIGHT*2/3, 'moe_rei_cat').setOrigin(0.5).setScale(15);
            this.add.tween({
                targets: cat,
                delay: 1000,
                duration: 500,
                angle: -1,
                scaleX: 0.8,
                scaleY: 0.8,
                ease: 'Bounce',
            });
            this.add.tween({
                targets: cat,
                delay: 4000,
                duration: 500,
                angle: 360,
                repeat: -1,
                repeatDelay: 2000,
                ease: 'Linear',
            });

            const moemoe = this.anims.create({
                key: 'moemoe',
                frames: [
                    { key: 'moemoe_1' },
                    { key: 'moemoe_2' },
                    { key: 'moemoe_3' },
                    { key: 'moemoe_4' },
                    { key: 'moemoe_5' },
                    { key: 'moemoe_6' },
                    { key: 'moemoe_7' },
                    // { key: 'moemoe_8' },
                ],
                frameRate: 5,
                delay: 2200,
            });
            this.add.sprite(WIDTH*10/16, HEIGHT*9/16, 'moe_heart').setScale(4).setAngle(-10).setToBack().play('moemoe');

            this.add.tween({
                targets: cat,
                delay: 4000,
                duration: 500,
                angle: 360,
                repeat: -1,
                repeatDelay: 2000,
                ease: 'Linear',
            });

            this.sound.play('score_100', {volume: 0.7});
            back_text.setAlpha(0.7);
            back_text_delay = 7000;
        }

        this.time.addEvent({
            delay: back_text_delay,
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
        scene.load.image('crying_rei', '뿌엥레이.png');
        scene.load.image('victory_rei', '이온사이다 1234.png');
        scene.load.image('moe_rei_body', '이온사이다 123 몸.png');
        scene.load.image('moe_rei_arm', '이온사이다 123 팔.png');
        scene.load.image('moe_rei_cat', '이온사이다 rei19_ver.2 고양이.png');
        scene.load.image('moemoe_1', '이온사이다 123 모에모에 1.png');
        scene.load.image('moemoe_2', '이온사이다 123 모에모에 2.png');
        scene.load.image('moemoe_3', '이온사이다 123 모에모에 3.png');
        scene.load.image('moemoe_4', '이온사이다 123 모에모에 4.png');
        scene.load.image('moemoe_5', '이온사이다 123 모에모에 5.png');
        scene.load.image('moemoe_6', '이온사이다 123 모에모에 6.png');
        scene.load.image('moemoe_7', '이온사이다 123 모에모에 7.png');
        scene.load.image('moemoe_8', '이온사이다 123 모에모에 8.png');
        scene.load.image('moe_heart', '이온사이다 123 heart.png');
    }
}

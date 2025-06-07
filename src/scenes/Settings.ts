import { Scale, Scene } from "phaser";
import { HEIGHT, WIDTH } from "../constants";

export class Settings extends Scene {
    constructor() {
        super("Settings");
    }

    create() {
        // background
        this.add.rectangle(WIDTH/2, HEIGHT/2, WIDTH, HEIGHT, 0xffffff, 0.7).setOrigin(0.5);
        // text_background
        this.add.graphics().fillStyle(0xffffff, 1).fillRoundedRect(WIDTH / 10, HEIGHT / 10, WIDTH * 8 / 10, HEIGHT * 8 / 10, HEIGHT / 30).setDepth(0);
        this.add.zone(WIDTH/2, HEIGHT/2, WIDTH, HEIGHT).setOrigin(0.5).setInteractive(); // 클릭 방지

        // 볼륨 조절 버튼
        const button_offset = HEIGHT / 10 * 4;
        const button_height = HEIGHT / 10;
        const button_gap = HEIGHT / 20;
        // load master volume
        let master_volume = localStorage.getItem('master_volume') || '5';
        let master_volume_number = parseInt(master_volume);
        // show master volume
        this.add.text(WIDTH / 3, button_offset + 0 * (button_height + button_gap), '마스터 볼륨', {
            fontSize: HEIGHT / 20,
            color: '#000000',
            fontFamily: 'Jalnan',
        }).setOrigin(0.5);
        const volume_text = this.add.text(WIDTH * 2 / 3, button_offset + 0 * (button_height + button_gap), master_volume, {
            fontSize: HEIGHT / 10,
            color: '#ffffff',
            fontFamily: 'Jalnan',
            stroke: '#000000',
            strokeThickness: 4,
        }).setOrigin(0.5).setScale(0.5 + master_volume_number * 0.1 * 0.7);
        this.add.text(WIDTH * 2 / 3 - WIDTH/10, button_offset + 0 * (button_height + button_gap), '작게', {
            fontSize: HEIGHT / 20,
            color: '#ffffff',
            fontFamily: 'Jalnan',
            stroke: '#000000',
            strokeThickness: 4,
        }).setOrigin(0.5).setInteractive().on('pointerup', () => {
            master_volume_number = parseInt(master_volume);
            master_volume_number = Math.max(0, master_volume_number - 1);
            this.sound.setVolume(master_volume_number * 0.1);
            master_volume = master_volume_number.toString()
            localStorage.setItem('master_volume', master_volume);
            volume_text.setText(master_volume);
            volume_text.setScale(0.5 + master_volume_number * 0.1 * 0.7);
        });
        this.add.text(WIDTH * 2 / 3 + WIDTH/10, button_offset + 0 * (button_height + button_gap), '크게', {
            fontSize: HEIGHT / 20,
            color: '#ffffff',
            fontFamily: 'Jalnan',
            stroke: '#000000',
            strokeThickness: 4,
        }).setOrigin(0.5).setInteractive().on('pointerup', () => {
            master_volume_number = parseInt(master_volume);
            master_volume_number = Math.min(10, master_volume_number + 1);
            this.sound.setVolume(master_volume_number * 0.2);
            master_volume = master_volume_number.toString()
            localStorage.setItem('master_volume', master_volume);
            volume_text.setText(master_volume);
            volume_text.setScale(0.5 + master_volume_number * 0.1 * 0.7);
        });
        // save master volume
        localStorage.setItem('master_volume', master_volume.toString());

        // 전체화면
        this.add.text(WIDTH / 3, button_offset + 1 * (button_height + button_gap), '전체화면', {
            fontSize: HEIGHT / 20,
            color: '#000000',
            fontFamily: 'Jalnan',
        }).setOrigin(0.5);
        const fullscreen_text = this.add.text(WIDTH * 2 / 3, button_offset + 1 * (button_height + button_gap), this.scale.isFullscreen ? '끄기' : '켜기', {
            fontSize: HEIGHT / 20,
            color: '#ffffff',
            fontFamily: 'Jalnan',
            stroke: '#000000',
            strokeThickness: 4,
        }).setOrigin(0.5).setInteractive().on('pointerup', () => {
            this.sound.play('tap1', {volume: 0.4});
            if (this.scale.isFullscreen) {
                this.scale.stopFullscreen();
                fullscreen_text.setText('켜기');
            } else {
                this.scale.startFullscreen();
                fullscreen_text.setText('끄기');
                screen.orientation.lock(Scale.Orientation.LANDSCAPE).catch(() => {});
            }
        });
        
        // 돌아가기
        const back_text = this.add.text(WIDTH / 2, HEIGHT * 33 / 40, '닫기', {
            fontSize: HEIGHT / 20,
            color: '#ff0000',
            fontFamily: 'Jalnan',
        }).setOrigin(0.5);

        back_text.setInteractive();
        back_text.on('pointerup', () => {
            this.sound.play('tap1', {volume: 0.4});
            this.scene.stop();
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
import { Scene } from "phaser";
import { FoodName, HEIGHT, IngredientName, ToolName, WIDTH } from "../constants";

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
        // load master volume
        let master_volume = localStorage.getItem('master_volume') || '5';
        let master_volume_number = parseInt(master_volume);
        // show master volume
        this.add.text(WIDTH / 3, HEIGHT / 2, '마스터 볼륨', {
            fontSize: HEIGHT / 20,
            color: '#000000',
            fontFamily: 'Jalnan',
        }).setOrigin(0.5);
        const volume_text = this.add.text(WIDTH * 2 / 3, HEIGHT / 2, master_volume, {
            fontSize: HEIGHT / 10,
            color: '#ffffff',
            fontFamily: 'Jalnan',
            stroke: '#000000',
            strokeThickness: 4,
        }).setOrigin(0.5).setScale(0.5 + master_volume_number * 0.1 * 0.7);
        this.add.text(WIDTH * 2 / 3 - WIDTH/10, HEIGHT / 2, '작게', {
            fontSize: HEIGHT / 30,
            color: '#ffffff',
            fontFamily: 'Jalnan',
            stroke: '#000000',
            strokeThickness: 4,
        }).setOrigin(0.5).setInteractive().on('pointerup', () => {
            master_volume_number = parseInt(master_volume);
            master_volume_number = Math.max(0, master_volume_number - 1);
            this.sound.setVolume(master_volume_number * 0.2);
            master_volume = master_volume_number.toString()
            localStorage.setItem('master_volume', master_volume);
            volume_text.setText(master_volume);
            volume_text.setScale(0.5 + master_volume_number * 0.1 * 0.7);
        });
        this.add.text(WIDTH * 2 / 3 + WIDTH/10, HEIGHT / 2, '크게', {
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
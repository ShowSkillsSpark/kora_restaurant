import { GameObjects, Scene } from "phaser";
import { HEIGHT, WIDTH } from "../constants";

class Button extends GameObjects.Container {
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, text: string) {
        super(scene, x, y);
        scene.add.existing(this);

        this.setSize(width, height);
        
        const bg = scene.add.graphics().fillStyle(0x575876, 0.5).fillRoundedRect(-width/2, -height/2, width, height, height * 0.3).setDepth(0);
        this.add([
            bg,
            scene.add.text(0, 0, text, { fontFamily: 'Jalnan', fontSize: '60px', color: '#ffffff' }).setOrigin(0.5).setDepth(1).setPadding(20),
        ]);

        this.on('pointerover', () => {
            scene.tweens.add({
                targets: this,
                scale: 1.2,
                duration: 50,
            });
        });
        this.on('pointerout', () => {
            scene.tweens.add({
                targets: this,
                scale: 1,
                duration: 50,
            });
        });
    }
}

class Title extends GameObjects.Container {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);
        scene.add.existing(this);

        const open = scene.add.text(-250, -100, "신장개업", {
            fontFamily: 'Jalnan', fontSize: '60px', color: '#ee0000',
            stroke: '#000000', strokeThickness: 2,
            shadow: { offsetX: 5, offsetY: 5, blur: 5, stroke: false },
        }).setOrigin(0.5).setDepth(1).setPadding(20).setAngle(-5);
        const kora = scene.add.text(0, 0, "코 라 분 식", {
            fontFamily: 'Jalnan', fontSize: '150px', color: '#ffffff',
            stroke: '#000000', strokeThickness: 4,
            shadow: { offsetX: 5, offsetY: 5, blur: 5, stroke: false },
        }).setOrigin(0.5).setDepth(1).setPadding(20);

        this.add([
            kora,
            open,
        ]);
    }
}

export class MainMenu extends Scene {
    constructor() {
        super("MainMenu");
    }

    preload() {
        this.load.setPath('assets');
        this.load.audio('welcome1', 'audio/welcome1.wav');
    }

    create() {
        // 타이틀
        new Title(this, WIDTH / 2, 3 * HEIGHT / 10);

        const button_offset = 9 * HEIGHT / 20;
        const button_height = HEIGHT / 10;
        const button_gap = HEIGHT / 20;
        const button_width = WIDTH / 3;
        // 영업 시작
        new Button(this, WIDTH / 2, button_offset + 1 * (button_height + button_gap) - button_height, button_width, button_height, "영업 시작").setInteractive().on('pointerup', () => {
            this.sound.play('welcome1');
            this.scene.start("MainGame");
        });

        // 레시피
        new Button(this, WIDTH / 2, button_offset + 2 * (button_height + button_gap) - button_height, button_width, button_height, "레시피").setInteractive().on('pointerup', () => {
            this.scene.start("Recipe");
        });

        // 크레딧
        const credit_button = new Button(this, WIDTH / 2, button_offset + 3 * (button_height + button_gap) - button_height, button_width, button_height, "크레딧").on('pointerup', () => {
            this.scene.start("Credits");
        });
        // credit_button.setInteractive();

        // debug
        // this.scene.start("MainGame");
    }
}
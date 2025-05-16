import { GameObjects, Scene } from 'phaser';
import { HEIGHT, WIDTH } from '../constants';

class Button extends GameObjects.Container {
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, text: string) {
        super(scene, x, y);
        scene.add.existing(this);

        this.setSize(width, height);

        const bg = scene.add.graphics().fillStyle(0x575876, 0.7).fillRoundedRect(-width/2, -height/2, width, height, height * 0.3).setDepth(0);
        const button_text = scene.add.text(0, 0, text, { fontFamily: 'Jalnan', fontSize: '60px', color: '#ffffff' }).setOrigin(0.5).setDepth(1).setPadding(20)
        this.add([bg, button_text]);

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

        const open = scene.add.text(-250, -100, '신장개업', {
            fontFamily: 'Jalnan', fontSize: '60px', color: '#ee0000',
            stroke: '#666666', strokeThickness: 5,
            shadow: { offsetX: 5, offsetY: 5, blur: 5, stroke: false },
        }).setOrigin(0.5).setDepth(1).setPadding(20).setAngle(-5);
        const kora = scene.add.text(0, 0, '코 라 분 식', {
            fontFamily: 'Jalnan', fontSize: '150px', color: '#ffffff',
            stroke: '#000000', strokeThickness: 10,
            shadow: { offsetX: 5, offsetY: 5, blur: 5, stroke: false },
        }).setOrigin(0.5).setDepth(1).setPadding(20);

        this.add([kora, open]);
    }
}

export class MainMenu extends Scene {
    start_offset: number;
    spring: GameObjects.Image | undefined;
    summer: GameObjects.Image | undefined;
    fall: GameObjects.Image | undefined;
    winter: GameObjects.Image | undefined;

    constructor() {
        super('MainMenu');
        this.start_offset = WIDTH;
    }

    create() {
        // 배경
        this.spring = this.add.image(this.start_offset, HEIGHT/2 + 100, '봄').setOrigin(0.5).setScale(0.7);
        this.summer = this.add.image(this.start_offset + this.spring.displayWidth, HEIGHT/2 + 100, '여름').setOrigin(0.5).setScale(0.7);
        this.fall = this.add.image(this.start_offset + 2 * this.spring.displayWidth, HEIGHT/2 + 100, '가을').setOrigin(0.5).setScale(0.7);
        this.winter = this.add.image(this.start_offset + -1 * this.spring.displayWidth, HEIGHT/2 + 100, '겨울').setOrigin(0.5).setScale(0.7);

        // 타이틀
        new Title(this, WIDTH / 2, 3 * HEIGHT / 10);

        const button_offset = 9 * HEIGHT / 20;
        const button_height = HEIGHT / 10;
        const button_gap = HEIGHT / 20;
        const button_width = WIDTH / 3;
        // 영업 시작
        new Button(this, WIDTH / 2, button_offset + 1 * (button_height + button_gap) - button_height, button_width, button_height, '영업 시작').setInteractive().on('pointerup', () => {
            this.sound.play('welcome1');
            this.scene.start('MainGame');
        });

        // 레시피
        new Button(this, WIDTH / 2, button_offset + 2 * (button_height + button_gap) - button_height, button_width, button_height, '레시피').setInteractive().on('pointerup', () => {
            this.sound.play('tap1', {volume: 0.4});
            this.scene.start('Recipe');
        });

        // 크레딧
        const credit_button = new Button(this, WIDTH / 2, button_offset + 3 * (button_height + button_gap) - button_height, button_width, button_height, '크레딧').on('pointerup', () => {
            this.sound.play('tap1', {volume: 0.4});
            this.scene.start('Credits');
        });
        credit_button.setInteractive();

        // debug
        // this.scene.start('MainGame');
    }

    update() {
        const speed = 3;
        if (!!this.spring && !!this.summer && !!this.fall && !!this.winter) {
            this.spring.x -= speed;
            this.summer.x -= speed;
            this.fall.x -= speed;
            this.winter.x -= speed;
            if (this.spring.x < -this.spring.displayWidth) this.spring.x = this.start_offset + 2 * this.spring.displayWidth;
            if (this.summer.x < -this.spring.displayWidth) this.summer.x = this.start_offset + 2 * this.spring.displayWidth;
            if (this.fall.x < -this.spring.displayWidth) this.fall.x = this.start_offset + 2 * this.spring.displayWidth;
            if (this.winter.x < -this.spring.displayWidth) this.winter.x = this.start_offset + 2 * this.spring.displayWidth;
        }
    }

    static preload(scene: Scene) {
        scene.load.setPath('assets/MainMenu');
        scene.load.audio('welcome1', 'welcome1.wav');
        scene.load.image('봄', '봄.jpg');
        scene.load.image('여름', '여름.jpg');
        scene.load.image('가을', '가을.jpg');
        scene.load.image('겨울', '겨울.jpg');
    }
}
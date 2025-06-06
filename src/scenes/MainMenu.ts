import { GameObjects, Input, Scene } from 'phaser';
import { HEIGHT, WIDTH } from '../constants';
import { version } from '../../package.json';

class Button extends GameObjects.Container {
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, text: string) {
        super(scene, x, y);
        scene.add.existing(this);

        this.setSize(width, height);

        const bg = scene.add.graphics().fillStyle(0x575876, 0.8).fillRoundedRect(-width/2, -height/2, width, height, height * 0.3).setDepth(0);
        const button_text = scene.add.text(0, 0, text, {
            fontFamily: 'Jalnan', fontSize: '60px', color: '#ffffff', stroke: '#000000', strokeThickness: 3,
        }).setOrigin(0.5).setDepth(1).setPadding(20)
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
            stroke: '#ffffff', strokeThickness: 5,
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
        this.start_offset = Math.floor(Math.random() * 4);
    }

    create() {
        // 배경
        let background_count = Math.floor(Math.random() * 4);
        const background = this.add.image(WIDTH/2, HEIGHT/2, 'MainMenu_background_' + background_count).setOrigin(0.5).setScale(0.7);
        this.time.addEvent({
            delay: 4000,
            callback: () => {
                background_count = (background_count + 1) % 4;
                background.setTexture('MainMenu_background_' + background_count);
            },
            loop: true,
            paused: false,
        })

        // 최고점수
        let tap_water_only_flag = sessionStorage.getItem('tap_water_only_flag') === 'true';
        const high_score = localStorage.getItem(tap_water_only_flag ? 'high_score_tap' : 'high_score') || '0';
        const high_score_str = high_score.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        const high_socre_text = this.add.text(WIDTH - WIDTH / 100, HEIGHT/100, '최고점수: ' + high_score_str + ' 치즈', {
            fontSize: HEIGHT / 20,
            color: tap_water_only_flag ? '#ffffcc' : '#ffffff',
            fontFamily: 'StudyHard',
            stroke: '#000000',
            strokeThickness: 4,
        }).setOrigin(1, 0);

        // 수돗물단 활성화 버튼
        const tap_water_button = this.add.image(WIDTH / 100, HEIGHT/100, 'cup_water').setScale(0.1).setAlpha(tap_water_only_flag ? 1 : 0.6).setOrigin(0).setInteractive().on('pointerup', () => {
            this.sound.play('tap1', {volume: 0.4});
            tap_water_only_flag = !tap_water_only_flag;
            sessionStorage.setItem('tap_water_only_flag', tap_water_only_flag.toString());
            tap_water_button.setAlpha(tap_water_only_flag ? 1 : 0.6);
            const high_score = localStorage.getItem(tap_water_only_flag ? 'high_score_tap' : 'high_score') || '0';
            const high_score_str = high_score.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            high_socre_text.setText('최고점수: ' + high_score_str + ' 치즈').setColor(tap_water_only_flag ? '#ffffcc' : '#ffffff');
        });

        // 타이틀
        new Title(this, WIDTH / 2, 3 * HEIGHT / 10);

        const button_offset = 9 * HEIGHT / 20;
        const button_height = HEIGHT / 10;
        const button_gap = HEIGHT / 30;
        const button_width = WIDTH / 3;
        // 영업 시작
        new Button(this, WIDTH / 2, button_offset + 1 * (button_height + button_gap) - button_height, button_width, button_height, '영업 시작').setInteractive().on('pointerup', (pointer: Input.Pointer) => {
            this.sound.play('welcome_0', {volume: 0.7});
            this.scene.start('MainGame');
        });

        // 레시피
        new Button(this, WIDTH / 2, button_offset + 2 * (button_height + button_gap) - button_height, button_width, button_height, '레시피').setInteractive().on('pointerup', () => {
            this.sound.play('tap1', {volume: 0.4});
            this.scene.launch('Recipe');
        });

        // 환경설정
        new Button(this, WIDTH / 2, button_offset + 3 * (button_height + button_gap) - button_height, button_width, button_height, '환경설정').setInteractive().on('pointerup', () => {
            this.sound.play('tap1', {volume: 0.4});
            this.scene.launch('Settings');
        });

        // 크레딧
        const credit_button = new Button(this, WIDTH / 2, button_offset + 4 * (button_height + button_gap) - button_height, button_width, button_height, '크레딧').on('pointerup', () => {
            this.sound.play('tap1', {volume: 0.4});
            this.scene.launch('Credits');
        });
        credit_button.setInteractive();

        // 버전
        this.add.text(WIDTH / 100, HEIGHT, 'v' + version, {
            fontSize: HEIGHT / 30,
            color: '#ffffff',
            fontFamily: 'StudyHard',
            stroke: '#000000',
            strokeThickness: HEIGHT/300,
        }).setOrigin(0, 1);

        // bgm
        this.sound.getAllPlaying().forEach((sound) => {
            sound.stop();
        });
        const rand = Math.floor(Math.random() * 6);
        this.sound.play('MainMenu_bgm_' + rand, {volume: 0.3, loop: true, rate: 1});

        // debug
        // this.scene.start('MainGame');
        // this.scene.launch('Recipe');
        // this.scene.launch('Credits');
        // this.scene.start('GameOver');
    }

    static preload(scene: Scene) {
        scene.load.setPath('assets/MainMenu');
        scene.load.audio('welcome_0', 'welcome_0.wav');
        scene.load.image('MainMenu_background_0', '봄.jpg');
        scene.load.image('MainMenu_background_1', '여름.jpg');
        scene.load.image('MainMenu_background_2', '가을.jpg');
        scene.load.image('MainMenu_background_3', '겨울.jpg');
        scene.load.audio('MainMenu_bgm_0', 'Five Card Shuffle.webm');
        scene.load.audio('MainMenu_bgm_1', 'Wallpaper.mp3');
        scene.load.audio('MainMenu_bgm_2', 'Radio Martini.mp3');
        scene.load.audio('MainMenu_bgm_3', 'Hyperfun.mp3');
        scene.load.audio('MainMenu_bgm_4', 'Fig Leaf Rag.mp3');
        scene.load.audio('MainMenu_bgm_5', 'Look Busy.mp3');
    }
}
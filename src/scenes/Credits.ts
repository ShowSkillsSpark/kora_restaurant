import { Display, Game, GameObjects, Input, Scene } from "phaser";
import { HEIGHT, WIDTH } from "../constants";

class Card extends GameObjects.Container {
    constructor(scene: Scene, x: number, y: number, role: string, name: string) {
        super(scene, x, y);
        scene.add.existing(this);
        this.add([
            scene.add.text(0, 0, role, {
                fontSize: HEIGHT / 16,
                color: '#000000',
                fontFamily: 'NoonnuBasicGothicRegular',
            }).setOrigin(0.5).setPadding(10),
            scene.add.text(0, HEIGHT/8, name, {
                fontSize: HEIGHT / 8,
                color: '#000000',
                fontFamily: 'NoonnuBasicGothicRegular',
            }).setOrigin(0.5).setPadding(10),
        ]);
    }
}
class Content extends GameObjects.Container {
    constructor(scene: Scene, x: number, y: number, width: number, height: number) {
        super(scene, x, y);
        scene.add.existing(this);
        const font_licence_text = `(주)여기어때컴퍼니가 제공한 여기어때 잘난체,
(주)조선일보사에서 제공한 조선궁서체,
(주)보이저엑스에서 제공한 온글잎 공부잘하자나,
눈누X토끼네활자공장에서 제공한 눈누 기초고딕이 적용되어 있습니다.`
        const music_licence_text = `"Carefree", "Carpe Diem", "Fig Leaf Rag", "Five Card Shuffle", "Flying Kerfuffle", "Hyperfun", "Look Busy", "Pixel Peeker Polka - faster", "Radio Martini", "Wallpaper"
Kevin MacLeod (incompetech.com)
Licensed under Creative Commons: By Attribution 3.0
http://creativecommons.org/licenses/by/3.0/`
        this.add([
            new Card(scene, 0, HEIGHT / 4, '기획/개발', '실력발휘'),
            new Card(scene, 0, HEIGHT / 4 + HEIGHT * 3 / 5, '목소리', '하야사카 레이'),
            new Card(scene, 0, HEIGHT / 4 + HEIGHT * 3 / 5 * 2, '효과음 제공', '피디님'),
            scene.add.text(0, HEIGHT / 4 + HEIGHT * 3 / 5 * 3, '출처 표기', {
                fontSize: HEIGHT / 16,
                color: '#000000',
                fontFamily: 'NoonnuBasicGothicRegular',
                wordWrap: {
                    width: width * 0.9,
                }
            }).setOrigin(0.5).setPadding(10),
            scene.add.text(0, HEIGHT / 4 + HEIGHT * 3 / 5 * 3 + HEIGHT / 4.5, [font_licence_text, music_licence_text], {
                fontSize: HEIGHT / 32,
                color: '#000000',
                align: 'center',
                fontFamily: 'NoonnuBasicGothicRegular',
                wordWrap: {
                    width: width * 0.9,
                }
            }).setOrigin(0.5).setPadding(10),

            scene.add.text(0, HEIGHT / 4 + HEIGHT * 3 / 5 * 4, '.', {
                fontSize: HEIGHT / 16,
                color: '#000000',
                fontFamily: 'ChosunGs',
            }).setOrigin(0.5).setPadding(10),
            scene.add.text(0, HEIGHT / 4 + HEIGHT * 3 / 5 * 4.2, '.', {
                fontSize: HEIGHT / 16,
                color: '#000000',
                fontFamily: 'ChosunGs',
            }).setOrigin(0.5).setPadding(10),
            scene.add.text(0, HEIGHT / 4 + HEIGHT * 3 / 5 * 4.4, '.', {
                fontSize: HEIGHT / 16,
                color: '#000000',
                fontFamily: 'ChosunGs',
            }).setOrigin(0.5).setPadding(10),
            scene.add.text(0, HEIGHT / 4 + HEIGHT * 3 / 5 * 5, '끝으로...\n게임 제작을 허락해주신 피디님께\n다시 한 번 감사드립니다.', {
                fontSize: HEIGHT / 16,
                color: '#000000',
                fontFamily: 'ChosunGs',
                wordWrap: {
                    width: width * 0.9,
                }
            }).setOrigin(0.5).setPadding(10),
        ]);
    }
}
export class Credits extends Scene {
    content: Content | undefined;
    constructor() {
        super("Credits");
    }

    create() {
        // background
        this.add.rectangle(WIDTH/2, HEIGHT/2, WIDTH, HEIGHT, 0xffffff, 0.7).setOrigin(0.5);
        // text_background
        this.add.graphics().fillStyle(0xffffff, 1).fillRoundedRect(WIDTH / 10, HEIGHT / 10, WIDTH * 8 / 10, HEIGHT * 8 / 10, HEIGHT / 30).setDepth(0);
        // text region
        const mask_rect = this.add.graphics().fillStyle(0xffffff, 1).fillRoundedRect(WIDTH * 3 / 20, HEIGHT * 3 / 20, WIDTH * 7 / 10, HEIGHT * 6 / 10, HEIGHT / 40);
        const mask = new Display.Masks.GeometryMask(this, mask_rect);
        this.content = new Content(this, WIDTH/2, HEIGHT/2, WIDTH * 8 / 10, HEIGHT * 8 / 10);
        this.content.setMask(mask);
        this.add.zone(WIDTH/2, HEIGHT/2, WIDTH, HEIGHT).setOrigin(0.5).setInteractive(); // 클릭 방지

        // 돌아가기
        const back_text = this.add.text(WIDTH / 2, HEIGHT * 33 / 40, '닫기', {
            fontSize: HEIGHT / 20,
            color: '#000000',
            fontFamily: 'Jalnan',
        }).setOrigin(0.5);

        back_text.setInteractive();
        back_text.on('pointerup', () => {
            this.sound.play('tap1', {volume: 0.4});
            this.scene.stop();
        });
        back_text.on('pointerover', () => {
            back_text.text = '플레이해 주셔서 감사합니다 ^^';
        });
        back_text.on('pointerout', () => {
            back_text.text = '닫기';
        });
    }

    update() {
        if (this.content) {
            if (this.content.y > -HEIGHT*2.8) this.content.y -= 2;
        }
    }
}
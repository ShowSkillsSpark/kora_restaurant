import { Game, GameObjects, Geom, Input, Scene } from "phaser";
import { HEIGHT, WIDTH } from "../constants";

class TopBar extends GameObjects.Container {
    time: GameObjects.Text;
    earn: GameObjects.Text;

    constructor(scene: Scene, x: number, y:number, width: number, height: number) {
        super(scene, x, y);
        scene.add.existing(this);

        // 영업시간
        const timeText = scene.add.text(-width / 4 - 100, 0, "남은 시간", {
            fontSize: height / 2,
            color: "#ffffff",
            fontFamily: "StudyHard",
            stroke: "#000000",
            strokeThickness: 4,
        }).setOrigin(0.5);
        this.time = scene.add.text(-width / 4 + 100, 0, "90초", {
            fontSize: height / 2,
            color: "#ffffff",
            fontFamily: "StudyHard",
            stroke: "#000000",
            strokeThickness: 4,
        }).setOrigin(0.5).setPadding(10);
        this.add([timeText, this.time]);

        // 매출
        const earnText = scene.add.text(width / 4 - 100, 0, "매출", {
            fontSize: height / 2,
            color: "#ffffff",
            fontFamily: "StudyHard",
            stroke: "#000000",
            strokeThickness: 4,
        }).setOrigin(0.5);
        this.earn = scene.add.text(width / 4 + 100, 0, "5,000원", {
            fontSize: height / 2,
            color: "#ffffff",
            fontFamily: "StudyHard",
            stroke: "#000000",
            strokeThickness: 4,
        }).setOrigin(0.5).setPadding(10);
        this.add([earnText, this.earn]);
    }
}

class Order extends GameObjects.Container {
    text: GameObjects.Text;
    face: GameObjects.Image;

    constructor(scene: Scene, x: number, y:number, width: number, height: number) {
        super(scene, x, y);
        scene.add.existing(this);

        const bg = scene.add.image(0, - height / 10, 'talk').setOrigin(0.5);
        bg.setScale(width / bg.width, height / bg.height * 0.7);

        this.text = scene.add.text(0, - 3 * height / 20, "코라떡볶이 1인분이랑,\n수돗물 1컵 주세요", {
            fontSize: height * 0.15,
            color: "#000000",
            fontFamily: "StudyHard",
            wordWrap: { width: width - 20 },
        }).setOrigin(0.5).setPadding(10);
        this.face = scene.add.image(0, 5 * height / 20, "smile").setOrigin(0.5);
        this.face.setScale(height / this.face.height * 0.25);
        const zone = scene.add.zone(0, 0, width, height).setRectangleDropZone(width, height).setName('order');
        zone.setData('order', this);

        this.add([bg, this.text, this.face, zone]);
    }

    static preload(scene: Scene) {
        scene.load.setPath('assets');
        // 말풍선
        scene.load.image('talk', 'fukidashi_pop06.png');

        // 시간 흐름에 따른 변화
        scene.load.image('smile', 'mark_face_smile.png');
        scene.load.image('jito', 'mark_face_jito.png');
        scene.load.image('ase', 'mark_face_ase.png');
        scene.load.image('angry', 'mark_face_angry.png');

        // 요리 품질에 따른 변화
        scene.load.image('cry', 'mark_face_cry.png');
        scene.load.image('laugh', 'mark_face_laugh.png');
        scene.load.image('tere', 'mark_face_tere.png');

        // 서비스 받았을 때
        scene.load.image('hehe', 'mark_face_hehe.png');
    }
}

class Table extends GameObjects.Container {
    constructor(scene: Scene, x: number, y:number, width: number, height: number) {
        super(scene, x, y);
        scene.add.existing(this);

        const table = scene.add.graphics().fillStyle(0xffffff, 1).fillPoints([
            new Geom.Point(-width/2 + width/20, -height/2 + height/5),
            new Geom.Point(-width/2 - width/20, height/2),
            new Geom.Point(width/2 + width/20, height/2),
            new Geom.Point(width/2 - width/20, -height/2 + height/5),
        ]);
        this.add([table]);
    }
}

class Ingredient extends GameObjects.Container {
    returnX: number;
    returnY: number;

    constructor(scene: Scene, x: number, y:number, width: number, height: number, name: string) {
        super(scene, x, y);
        scene.add.existing(this);
        this.returnX = x;
        this.returnY = y;
        this.name = name;
        
        const bg = scene.add.rectangle(0, 0, width, height, 0xffffff).setOrigin(0.5).setStrokeStyle(5, 0x000000);
        const text = scene.add.text(0, 0, name, {
            fontSize: height / 2,
            color: "#ff0000",
            fontFamily: "StudyHard",
        }).setOrigin(0.5).setPadding(10);

        this.add([bg, text]);

        this.setSize(width, height).setInteractive({ draggable: true });
        this.on('dragstart', (pointer: Input.Pointer) => {
            scene.children.bringToTop(this);
        });
        this.on('drag', (pointer: Input.Pointer, dragX: number, dragY: number) => {
            this.setPosition(dragX, dragY);
        });
        this.on('dragend', (pointer: Input.Pointer, dragX: number, dragY: number, dropped: boolean) => {
            this.setPosition(this.returnX, this.returnY);
        });
        this.on('drop', (pointer: Input.Pointer, dropZone: GameObjects.Zone) => {
            const tool = dropZone.getData('tool');
            if (tool) {
                tool.putIngredient(this.name);
            }
            this.setPosition(this.returnX, this.returnY);
        });
    }
}
class IngredientPosition extends GameObjects.Container {
    width: number;
    height: number;
    
    constructor(scene: Scene, x: number, y:number, width: number, height: number, name: string) {
        super(scene, x, y);
        scene.add.existing(this);
        this.width = width;
        this.height = height;
        this.name = name;
        
        const bg = scene.add.rectangle(0, 0, width, height, 0xffffff).setOrigin(0.5).setStrokeStyle(5, 0x000000);
        const text = scene.add.text(0, 0, name, {
            fontSize: height / 2,
            color: "#000000",
            fontFamily: "StudyHard",
        }).setOrigin(0.5).setPadding(10);

        this.add([bg, text]);
    }

    createIngredients() {
        const x = this.parentContainer.x + this.x;
        const y = this.parentContainer.y + this.y;
        const width = this.width * 0.8;
        const height = this.height * 0.8;
        new Ingredient(this.scene, x, y, width, height, this.name);
        new Ingredient(this.scene, x, y, width, height, this.name);
    }
}
class Tap extends GameObjects.Container {
    constructor(scene: Scene, x: number, y:number, width: number, height: number, name: string) {
        super(scene, x, y);
        scene.add.existing(this);
        this.name = name;
        
        const bg = scene.add.rectangle(0, 0, width, height, 0xffffff).setOrigin(0.5).setStrokeStyle(5, 0x000000);
        const text = scene.add.text(0, 0, name, {
            fontSize: height / 2,
            color: "#000000",
            fontFamily: "StudyHard",
        }).setOrigin(0.5).setPadding(10);
        const zone = scene.add.zone(0, 0, width, height).setRectangleDropZone(width, height).setName('tap');
        zone.setData('tool', null);

        this.add([bg, text, zone]);
    }
}
class IngredientShelf extends GameObjects.Container {
    constructor(scene: Scene, x: number, y:number, width: number, height: number) {
        super(scene, x, y);
        scene.add.existing(this);

        const rice_cake = new IngredientPosition(scene, - 7 * width / 16, 0, width / 8, height / 2, "떡");
        const sauce = new IngredientPosition(scene, - 5 * width / 16, 0, width / 8, height / 2, "특제소스");
        const fish_cake = new IngredientPosition(scene, - 3 * width / 16, 0, width / 8, height / 2, "어묵");
        const spring_onion = new IngredientPosition(scene, - 1 * width / 16, 0, width / 8, height / 2, "파");
        const water_tap = new Tap(scene, 3 * width / 16, 0, width / 8, height / 2, "수돗물");
        const cider_tap = new Tap(scene, 5 * width / 16, 0, width / 8, height / 2, "사이다");
        const cola_tap = new Tap(scene, 7 * width / 16, 0, width / 8, height / 2, "콜라");

        this.add([rice_cake, sauce, fish_cake, spring_onion, water_tap, cider_tap, cola_tap]);

        [rice_cake, sauce, fish_cake, spring_onion].forEach((position: IngredientPosition) => {
            position.createIngredients();
        });
    }
}

class Burner extends GameObjects.Container {
    constructor(scene: Scene, x: number, y:number, width: number, height: number) {
        super(scene, x, y);
        scene.add.existing(this);
        
        const bg = scene.add.rectangle(0, 0, width, height, 0xffffff).setOrigin(0.5).setStrokeStyle(5, 0x000000);
        const text = scene.add.text(0, 0, '버너', {
            fontSize: height / 2,
            color: "#000000",
            fontFamily: "StudyHard",
        }).setOrigin(0.5).setPadding(10);
        const zone = scene.add.zone(0, 0, width, height).setRectangleDropZone(width, height).setName('burner');
        zone.setData('tool', null);

        this.add([bg, text, zone]);
    }
}
class Trash extends GameObjects.Container {
    constructor(scene: Scene, x: number, y:number, width: number, height: number) {
        super(scene, x, y);
        scene.add.existing(this);
        
        const bg = scene.add.rectangle(0, 0, width, height, 0xffffff).setOrigin(0.5).setStrokeStyle(5, 0x000000);
        const text = scene.add.text(0, 0, '쓰레기통', {
            fontSize: height / 2,
            color: "#000000",
            fontFamily: "StudyHard",
        }).setOrigin(0.5).setPadding(10);
        const zone = scene.add.zone(0, 0, width, height).setRectangleDropZone(width, height).setName('trash');

        this.add([bg, text, zone]);
    }
}
class Tool extends GameObjects.Container {
    toolX: number;
    toolY: number;
    returnX: number;
    returnY: number;
    lastZone: GameObjects.Zone | null = null;
    box: Set<string> = new Set<string>();
    box_text: GameObjects.Text;

    constructor(scene: Scene, x: number, y:number, width: number, height: number, name: string) {
        super(scene, x, y);
        scene.add.existing(this);
        this.toolX = x;
        this.toolY = y;
        this.returnX = x;
        this.returnY = y;
        this.name = name;

        const bg = scene.add.rectangle(0, 0, width, height, 0xffffff).setOrigin(0.5).setStrokeStyle(5, 0x000000);
        const text = scene.add.text(0, -height / 4, name, {
            fontSize: height / 2,
            color: "#ff0000",
            fontFamily: "StudyHard",
        }).setOrigin(0.5).setPadding(10);
        this.box_text = scene.add.text(0, height / 4, '', {
            fontSize: height / 4,
            color: "#ff0000",
            fontFamily: "StudyHard",
            wordWrap: { width: width * 0.9 },
        }).setOrigin(0.5).setPadding(10);

        this.add([bg, text, this.box_text]);

        this.setSize(width, height).setInteractive({ draggable: true });
        this.on('dragstart', (pointer: Input.Pointer) => {
            scene.children.bringToTop(this);
        });
        this.on('drag', (pointer: Input.Pointer, dragX: number, dragY: number) => {
            this.setPosition(dragX, dragY);
        });
        this.on('dragend', (pointer: Input.Pointer, dragX: number, dragY: number, dropped: boolean) => {
            if (!dropped) {
                this.setPosition(this.returnX, this.returnY);
            }
        });
        this.on('drop', (pointer: Input.Pointer, dropZone: GameObjects.Zone) => {
            switch(dropZone.name) {
                case 'burner':
                    if (this.name === '컵') {
                        this.setPosition(this.returnX, this.returnY);
                    } else if (dropZone.getData('tool')) {
                        this.setPosition(this.returnX, this.returnY);
                    } else {
                        this.lastZone?.setData('tool', null);
                        dropZone.setData('tool', this);
                        this.lastZone = dropZone;
                        this.returnX = dropZone.parentContainer.parentContainer.x + dropZone.parentContainer.x + dropZone.x;
                        this.returnY = dropZone.parentContainer.parentContainer.y + dropZone.parentContainer.y + dropZone.y;
                        this.setPosition(this.returnX, this.returnY);
                    }
                    break;
                case 'tap':
                    if (dropZone.getData('tool')) {
                        this.setPosition(this.returnX, this.returnY);
                    } else {
                        this.lastZone?.setData('tool', null);
                        dropZone.setData('tool', this);
                        this.lastZone = dropZone;
                        this.returnX = dropZone.parentContainer.parentContainer.x + dropZone.parentContainer.x + dropZone.x;
                        this.returnY = dropZone.parentContainer.parentContainer.y + dropZone.parentContainer.y + dropZone.y;
                        this.setPosition(this.returnX, this.returnY);
                        this.putIngredient(dropZone.parentContainer.name);
                    }
                    break;
                case 'trash':
                    this.initTool();
                    break;
                case 'order':
                    this.lastZone?.setData('tool', null);
                    this.lastZone = dropZone;
                    this.returnX = dropZone.parentContainer.x + dropZone.x;
                    this.returnY = dropZone.parentContainer.y + dropZone.y;
                    this.setPosition(this.returnX, this.returnY);
                    this.setInteractive({ draggable: false });
                    break;
                default:
                    break;
            }
        });
    }

    putIngredient(ingredient: string) {
        this.box.add(ingredient);
        this.box_text.setText(Array.from(this.box).join(' '));
    }
    clearIngredient() {
        this.box.clear();
        this.box_text.setText('');
    }
    initTool() {
        this.lastZone?.setData('tool', null);
        this.lastZone = null;
        this.returnX = this.toolX;
        this.returnY = this.toolY;
        this.setPosition(this.returnX, this.returnY);
        this.clearIngredient();
    }
}
class ToolShelf extends GameObjects.Container {
    scene: Scene;
    width: number;
    height: number;
    name: string;

    constructor(scene: Scene, x: number, y:number, width: number, height: number, name: string) {
        super(scene, x, y);
        scene.add.existing(this);
        this.scene = scene;
        this.width = width;
        this.height = height;
        this.name = name;
        
        const bg = scene.add.rectangle(0, 0, width, height, 0xffffff).setOrigin(0.5).setStrokeStyle(5, 0x000000);
        const text = scene.add.text(0, 0, name, {
            fontSize: height / 2,
            color: "#000000",
            fontFamily: "StudyHard",
        }).setOrigin(0.5).setPadding(10);

        this.add([bg, text]);
    }

    createTools() {
        const x = this.parentContainer.x + this.x;
        const y = this.parentContainer.y + this.y;
        const width = this.width * 0.8;
        const height = this.height * 0.8;
        new Tool(this.scene, x, y, width, height, this.name);
        new Tool(this.scene, x, y, width, height, this.name);
        new Tool(this.scene, x, y, width, height, this.name);
        new Tool(this.scene, x, y, width, height, this.name);
    }
}

class Cooking extends GameObjects.Container {
    constructor(scene: Scene, x: number, y:number, width: number, height: number) {
        super(scene, x, y);
        scene.add.existing(this);

        const burner_0 = new Burner(scene, - 7 * width / 16, 0, width / 8, height / 2);
        const burner_1 = new Burner(scene, - 5 * width / 16, 0, width / 8, height / 2);
        const burner_2 = new Burner(scene, - 3 * width / 16, 0, width / 8, height / 2);
        const burner_3 = new Burner(scene, - 1 * width / 16, 0, width / 8, height / 2);

        const pot = new ToolShelf(scene, 1 * width / 16, 0, width / 8, height / 2, "냄비");
        const steamer = new ToolShelf(scene, 3 * width / 16, 0, width / 8, height / 2, "찜기");
        const cup = new ToolShelf(scene, 5 * width / 16, 0, width / 8, height / 2, "컵");

        const trash = new Trash(scene, 7 * width / 16, 0, width / 8, height / 2);

        this.add([burner_0, burner_1, burner_2, burner_3, pot, steamer, cup, trash]);

        [pot, steamer, cup].forEach((toolShelf: ToolShelf) => {
            toolShelf.createTools();
        });
    }
}

export class MainGame extends Scene {
    constructor() {
        super("MainGame");
    }

    preload() {
        Order.preload(this);
    }

    create() {
        // 탑바
        // this.add.rectangle(WIDTH / 2, 1 * HEIGHT / 20, WIDTH, 1 * HEIGHT / 10, 0xff00ff, 1).setStrokeStyle(5, 0x000000);
        new TopBar(this, WIDTH / 2, 1 * HEIGHT / 20, WIDTH, 1 * HEIGHT / 10);
        // 주문서
        // this.add.rectangle(WIDTH / 2, 5 * HEIGHT / 20, WIDTH, 3 * HEIGHT / 10, 0x00ffff, 1).setStrokeStyle(5, 0x000000);
        new Order(this, 1 * WIDTH / 8, 5 * HEIGHT / 20, WIDTH / 4, 4 * HEIGHT / 10);
        new Order(this, 3 * WIDTH / 8, 5 * HEIGHT / 20, WIDTH / 4, 4 * HEIGHT / 10);
        new Order(this, 5 * WIDTH / 8, 5 * HEIGHT / 20, WIDTH / 4, 4 * HEIGHT / 10);
        new Order(this, 7 * WIDTH / 8, 5 * HEIGHT / 20, WIDTH / 4, 4 * HEIGHT / 10);
        // 책상
        // this.add.rectangle(WIDTH / 2, 9 * HEIGHT / 20, WIDTH, 1 * HEIGHT / 10, 0xffffff, 1).setStrokeStyle(5, 0x000000);
        new Table(this, WIDTH / 2, 9 * HEIGHT / 20, WIDTH, 1 * HEIGHT / 10);
        // 재료
        // this.add.rectangle(WIDTH / 2, 12 * HEIGHT / 20, WIDTH, 2 * HEIGHT / 10, 0xffffff, 1).setStrokeStyle(5, 0x000000);
        new IngredientShelf(this, WIDTH / 2, 12 * HEIGHT / 20, WIDTH, 2 * HEIGHT / 10);
        // 조리
        // this.add.rectangle(WIDTH / 2, 17 * HEIGHT / 20, WIDTH, 3 * HEIGHT / 10, 0xffffff, 1).setStrokeStyle(5, 0x000000);
        new Cooking(this, WIDTH / 2, 17 * HEIGHT / 20, WIDTH, 3 * HEIGHT / 10);
    }

    // 주문서 추가
    // 요리 제작
    // 완성된 요리 선반에 올리기
    // 주문서 선반에 올리기
}
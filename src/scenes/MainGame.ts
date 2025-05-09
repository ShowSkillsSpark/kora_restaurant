import { GameObjects, Geom, Input, Scene } from 'phaser';
import { DrinkName, FoodName, HEIGHT, IngredientName, PROGRESS_LIST, ToolName, WIDTH } from '../constants';

class TopBar extends GameObjects.Container {
    time_text: GameObjects.Text;
    remain_timer: Phaser.Time.TimerEvent;
    remain_time: number;
    elapsed: number;

    earn_text: GameObjects.Text;

    constructor(scene: Scene, x: number, y:number, width: number, height: number, remain_time: number) {
        super(scene, x, y);
        scene.add.existing(this);
        this.remain_time = remain_time;
        this.elapsed = 0;
        sessionStorage.setItem('earn', '0');

        // 영업시간
        const timeText = scene.add.text(-width / 4 - 100, 0, '남은 시간', {
            fontSize: height / 2,
            color: '#ffffff',
            fontFamily: 'StudyHard',
            stroke: '#000000',
            strokeThickness: 4,
        }).setOrigin(0.5);
        this.time_text = scene.add.text(-width / 4 + 100, 0, this.remain_time + ' 초', {
            fontSize: height / 2,
            color: '#ffffff',
            fontFamily: 'StudyHard',
            stroke: '#000000',
            strokeThickness: 4,
        }).setOrigin(0.5).setPadding(10);
        this.add([timeText, this.time_text]);

        // 매출
        const earnText = scene.add.text(width / 4 - 100, 0, '매출', {
            fontSize: height / 2,
            color: '#ffffff',
            fontFamily: 'StudyHard',
            stroke: '#000000',
            strokeThickness: 4,
        }).setOrigin(0.5);
        this.earn_text = scene.add.text(width / 4 + 100, 0, '0' + ' 치즈', {
            fontSize: height / 2,
            color: '#ffffff',
            fontFamily: 'StudyHard',
            stroke: '#000000',
            strokeThickness: 4,
        }).setOrigin(0.5).setPadding(10);
        this.add([earnText, this.earn_text]);

        this.remain_timer = scene.time.addEvent({
            delay: 1000,
            callback: () => {
                this.elapsed += 1;
                if (this.elapsed > this.remain_time) {
                    scene.scene.start('GameOver');
                } else {
                    this.time_text.setText((this.remain_time - this.elapsed) + ' 초');
                }
            },
            loop: true,
            paused: true,
        });
    }

    resetTimer() {
        this.remain_timer.paused = true;
        this.elapsed = 0;
    }
    startTimer() {
        this.remain_timer.paused = false;
    }
    addEarn(price: number) {
        let earn = parseInt(sessionStorage.getItem('earn') || '0');
        earn += price;
        sessionStorage.setItem('earn', earn.toString());
        this.earn_text.setText(earn.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' 치즈');
    }
}

class Food {
    name: string;
    base_price: number;
    plus_price: number;
    tool_name: string;
    necessary: Set<string>;
    plus: Set<string>;
    temperature_range: number[][];

    constructor(name: string, base_price: number, plus_price: number, tool_name: string, neccessary: string[], plus: string[], temperature_range: number[][]) {
        this.name = name;
        this.base_price = base_price;
        this.plus_price = plus_price;
        this.tool_name = tool_name;
        this.necessary = new Set(neccessary);
        this.plus = new Set(plus);
        this.temperature_range = temperature_range;
    }

    calculatePrice(tool: Tool) {
        if (this.tool_name != tool.name) return 0;
        let base = 0;
        let score = 0;
        tool.box.forEach((ingredient_name: string) => {
            if (this.necessary.has(ingredient_name)) {
                base += 1;
            } else if (this.plus.has(ingredient_name)) {
                score += 1;
            } else {
                score -= 1;
            }
        });
        if (base < this.necessary.size) return 0;
        let temperature_score = 0;
        for (let r of this.temperature_range) {
            const temp = r[0];
            if (tool.temperature > temp) temperature_score = r[1];
            else break;
        }
        return this.base_price + (score + temperature_score) * this.plus_price;
    }

    toString() { return this.name; }

    static kora_tteokbokki = new Food(FoodName.KORA_TTEOKBOKKI, 4000, 500, ToolName.POT,
        [IngredientName.WATER, IngredientName.RICE_CAKE, IngredientName.SAUSE], [IngredientName.FISH_CAKE, IngredientName.SPRING_ONION],
        [[0, -8], [5, 1], [8, 2], [10, -8]]);

    static jako_ramen = new Food(FoodName.JAKO_RAMEN, 4000, 500, ToolName.POT,
        [IngredientName.WATER, IngredientName.NOODLE, IngredientName.RAMEN_SOUP], [IngredientName.EGG, IngredientName.SESAME],
        [[0, -8], [5, 1], [8, 2], [10, -8]]);

    static nande_sundae = new Food(FoodName.NANDE_SUNDAE, 3000, 500, ToolName.STEAMER,
        [IngredientName.WATER, IngredientName.SUNDAE], [],
        [[0, -6], [5, 1], [8, 2], [10, -6]]);

    static daedu_dumpling = new Food(FoodName.DAEDU_DUMPLING, 3000, 500, ToolName.STEAMER,
        [IngredientName.WATER, IngredientName.DUMPLING], [],
        [[0, -6], [5, 1], [8, 2], [10, -6]]);
}
class Drink extends Food {
    static tap_water = new Food(DrinkName.TAP_WATER, 1000, 100, ToolName.CUP,
        [IngredientName.WATER], [],
        [[0, 0]]);
    static uru_cider = new Food(DrinkName.URU_CIDER, 1000, 100, ToolName.CUP,
        [IngredientName.CIDER], [],
        [[0, 0]]);
    static kora_cola = new Food(DrinkName.KORA_COLA, 1000, 100, ToolName.CUP,
        [IngredientName.COLA], [],
        [[0, 0]]);
}
export class Order extends GameObjects.Container {
    text: GameObjects.Text;
    face: GameObjects.Image;

    requirement_list: Food[] = [];
    tool_list: Tool[] = [];
    cost: number = 0;

    progress: string[] = [];
    progress_timer: Phaser.Time.TimerEvent;
    progress_index: number = 0;

    respawn_timer: Phaser.Time.TimerEvent;

    constructor(scene: Scene, x: number, y:number, width: number, height: number, callback_submit: (price: number) => void) {
        super(scene, x, y);
        scene.add.existing(this);

        const bg = scene.add.image(0, - height / 10, 'talk').setOrigin(0.5);
        bg.setScale(width / bg.width, height / bg.height * 0.7);

        this.text = scene.add.text(0, - 3 * height / 20, '콘레이', {
            fontSize: height * 0.15,
            color: '#000000',
            fontFamily: 'StudyHard',
            wordWrap: { width: width * 0.9 },
        }).setOrigin(0.5).setPadding(10);
        this.face = scene.add.image(0, 5 * height / 20, 'smile').setOrigin(0.5);
        this.face.setScale(height / this.face.height * 0.25);
        const zone = scene.add.zone(0, 0, width, height).setRectangleDropZone(width, height).setName('order');
        zone.setData('order', this);

        this.add([bg, this.text, this.face, zone]);

        this.setSize(width, height);
        this.updateText();

        this.progress_timer = scene.time.addEvent({
            delay: 1000,
            callback: () => {
                this.progress_index += 1;
                if (this.progress_index < this.progress.length) {
                    this.text.setText(this.progress[this.progress_index]);
                } else {
                    this.tool_list.forEach((tool: Tool) => {
                        tool.returnTool();
                    });
                    this.visible = false;
                    this.respawn_timer.paused = false;
                    callback_submit(this.cost);
                    this.cost = 0;
                }
            },
            loop: true,
            paused: true,
        });
        this.respawn_timer = scene.time.addEvent({
            delay: 1000,
            callback: () => { this.newOrder(); },
            loop: false,
            paused: true,
        });
    }

    submit(tool: Tool) {
        tool.disableInteractive();

        this.tool_list.push(tool);
        const len = this.tool_list.length;
        this.tool_list.forEach((tool: Tool, index: number) => {
            const x = this.x - this.width / 2 + (index + 1) * this.width / (len + 1);
            const y = this.y + 3 * this.height / 8;
            tool.move(x, y);
        });

        let best_fit_index = null;
        let best_price = 0;
        this.requirement_list.forEach((food: Food, index: number) => {
            const food_price = food.calculatePrice(tool);
            if (food_price > best_price) {
                best_fit_index = index;
                best_price = food_price;
            }
        });
        if (best_fit_index != null) {
            this.requirement_list.splice(best_fit_index, 1);
            this.updateText();
            this.cost += best_price;
        }
        if (this.requirement_list.length == 0) {
            this.progress_timer.paused = false;
        }
    }
    updateText() {
        if (this.requirement_list.length > 0) {
            const text = this.requirement_list.join(', ') + ' 주세요.';
            this.text.setText(text);
        } else {
            this.text.setText(this.progress[this.progress_index]);
        }
    }
    randomRequirementList() {
        const requirement_list = [];
        while(requirement_list.length == 0) {
            // 수돗물단 버전
            // const food_list = [null];
            // const drink_list = [Drink.tap_water];
            // 일반 버전
            const food_list = [Food.kora_tteokbokki, Food.jako_ramen, Food.nande_sundae, Food.daedu_dumpling, null];
            const drink_list = [Drink.tap_water, Drink.uru_cider, Drink.kora_cola, null];
            const food = food_list[Math.floor(Math.random() * food_list.length)];
            const drink = drink_list[Math.floor(Math.random() * drink_list.length)];
            if (food) requirement_list.push(food);
            if (drink) requirement_list.push(drink);
        }
        return requirement_list;
    }
    randomProgress() {
        return PROGRESS_LIST[Math.floor(Math.random() * PROGRESS_LIST.length)];
    }
    newOrder() {
        this.requirement_list = this.randomRequirementList();
        this.updateText();

        this.tool_list = [];
        this.cost = 0;

        this.progress = this.randomProgress();
        this.progress_index = 0;
        this.progress_timer.paused = true;

        this.respawn_timer.reset({
            delay: 1000,
            callback: () => { this.newOrder(); },
            loop: false,
            paused: true,
        });

        this.visible = true;
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
            color: '#ff0000',
            fontFamily: 'StudyHard',
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
            color: '#000000',
            fontFamily: 'StudyHard',
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
            color: '#000000',
            fontFamily: 'StudyHard',
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

        const rice_cake = new IngredientPosition(scene, - 7 * width / 16, - height / 4, width / 8, height / 2, IngredientName.RICE_CAKE);
        const sauce = new IngredientPosition(scene, - 5 * width / 16,  - height / 4, width / 8, height / 2, IngredientName.SAUSE);
        const fish_cake = new IngredientPosition(scene, - 3 * width / 16,  - height / 4, width / 8, height / 2, IngredientName.FISH_CAKE);
        const spring_onion = new IngredientPosition(scene, - 1 * width / 16,  - height / 4, width / 8, height / 2, IngredientName.SPRING_ONION);
        const sundae = new IngredientPosition(scene, 1 * width / 16,  - height / 4, width / 8, height / 2, IngredientName.SUNDAE);

        const noodle = new IngredientPosition(scene, - 7 * width / 16, height / 4, width / 8, height / 2, IngredientName.NOODLE);
        const ramen_sauce = new IngredientPosition(scene, - 5 * width / 16, height / 4, width / 8, height / 2, IngredientName.RAMEN_SOUP);
        const egg = new IngredientPosition(scene, - 3 * width / 16, height / 4, width / 8, height / 2, IngredientName.EGG);
        const sesame = new IngredientPosition(scene, - 1 * width / 16, height / 4, width / 8, height / 2, IngredientName.SESAME);
        const dumpling = new IngredientPosition(scene, 1 * width / 16, height / 4, width / 8, height / 2, IngredientName.DUMPLING);

        const water_tap = new Tap(scene, 3 * width / 16, 0, width / 8, height, IngredientName.WATER);
        const cider_tap = new Tap(scene, 5 * width / 16, 0, width / 8, height, IngredientName.CIDER);
        const cola_tap = new Tap(scene, 7 * width / 16, 0, width / 8, height, IngredientName.COLA);

        this.add([
            rice_cake, sauce, fish_cake, spring_onion, sundae,
            noodle, ramen_sauce, egg, sesame, dumpling,
            water_tap, cider_tap, cola_tap
        ]);

        [
            rice_cake, sauce, fish_cake, spring_onion, sundae,
            noodle, ramen_sauce, egg, sesame, dumpling,
        ].forEach((position: IngredientPosition) => {
            position.createIngredients();
        });
    }
}

class Burner extends GameObjects.Container {
    constructor(scene: Scene, x: number, y:number, width: number, height: number) {
        super(scene, x, y);
        scene.add.existing(this);
        
        const bg = scene.add.rectangle(0, 0, width, height, 0xffffff).setOrigin(0.5).setStrokeStyle(5, 0x000000);
        const text = scene.add.text(0, 0, '화구', {
            fontSize: height / 2,
            color: '#000000',
            fontFamily: 'StudyHard',
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
            fontSize: height / 3,
            color: '#000000',
            fontFamily: 'StudyHard',
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

    tool_text: GameObjects.Text;
    box: Set<string> = new Set<string>();
    box_text: GameObjects.Text;
    temperature: number;
    temperatureEvent: Phaser.Time.TimerEvent;

    constructor(scene: Scene, x: number, y:number, width: number, height: number, name: string) {
        super(scene, x, y);
        scene.add.existing(this);
        this.toolX = x;
        this.toolY = y;
        this.returnX = x;
        this.returnY = y;
        this.name = name;
        this.temperature = 0;
        this.temperatureEvent = scene.time.addEvent({
            delay: 1000,
            callback: () => this.increaseTemperature(),
            loop: true,
            paused: true,
        });

        const bg = scene.add.rectangle(0, 0, width, height, 0xffffff).setOrigin(0.5).setStrokeStyle(5, 0x000000);
        this.tool_text = scene.add.text(0, -height / 4, name, {
            fontSize: height / 2,
            color: '#000000',
            fontFamily: 'StudyHard',
        }).setOrigin(0.5).setPadding(10);
        this.box_text = scene.add.text(0, height / 4, '', {
            fontSize: height / 5,
            color: '#000000',
            fontFamily: 'StudyHard',
            wordWrap: { width: width * 0.9 },
        }).setOrigin(0.5).setPadding(10);

        this.add([bg, this.tool_text, this.box_text]);

        this.setSize(width, height).setInteractive({ draggable: true });
        this.on('dragstart', (pointer: Input.Pointer) => {
            scene.children.bringToTop(this);
            this.temperatureEvent.paused = true;
        });
        this.on('drag', (pointer: Input.Pointer, dragX: number, dragY: number) => {
            this.setPosition(dragX, dragY);
        });
        this.on('dragend', (pointer: Input.Pointer, dragX: number, dragY: number, dropped: boolean) => {
            if (!dropped) {
                this.move(this.returnX, this.returnY);
            }
        });
        this.on('drop', (pointer: Input.Pointer, dropZone: GameObjects.Zone) => {
            switch(dropZone.name) {
                case 'burner':
                    if (this.name === ToolName.CUP) {
                        this.move(this.returnX, this.returnY);
                    } else if (dropZone.getData('tool')) {
                        this.move(this.returnX, this.returnY);
                    } else {
                        this.lastZone?.setData('tool', null);
                        dropZone.setData('tool', this);
                        this.lastZone = dropZone;
                        this.returnX = dropZone.parentContainer.parentContainer.x + dropZone.parentContainer.x + dropZone.x;
                        this.returnY = dropZone.parentContainer.parentContainer.y + dropZone.parentContainer.y + dropZone.y;
                        this.move(this.returnX, this.returnY);
                    }
                    break;
                case 'tap':
                    if (dropZone.getData('tool')) {
                        this.move(this.returnX, this.returnY);
                    } else {
                        this.lastZone?.setData('tool', null);
                        dropZone.setData('tool', this);
                        this.lastZone = dropZone;
                        this.returnX = dropZone.parentContainer.parentContainer.x + dropZone.parentContainer.x + dropZone.x;
                        this.returnY = dropZone.parentContainer.parentContainer.y + dropZone.parentContainer.y + dropZone.y;
                        this.move(this.returnX, this.returnY);
                        this.putIngredient(dropZone.parentContainer.name);
                    }
                    break;
                case 'trash':
                    this.returnTool();
                    break;
                case 'order':
                    if (this.name === ToolName.CUP && this.box.size == 0) {
                        this.move(this.returnX, this.returnY);
                    } else if ((this.name === ToolName.POT || this.name === ToolName.STEAMER) && this.temperature == 0){
                        this.move(this.returnX, this.returnY);
                    } else {
                        this.lastZone?.setData('tool', null);
                        this.lastZone = dropZone;
                        dropZone.getData('order').submit(this);
                    }
                    break;
                default:
                    break;
            }
        });
    }

    putIngredient(ingredient: string) {
        this.box.add(ingredient);
        this.box_text.setText(Array.from(this.box).join(' '));
        this.move(this.returnX, this.returnY);
    }
    returnTool() {
        this.lastZone?.setData('tool', null);
        this.lastZone = null;
        this.returnX = this.toolX;
        this.returnY = this.toolY;
        this.move(this.returnX, this.returnY);
        this.tool_text.setColor('#000000');
        this.box.clear();
        this.box_text.setText('');
        this.temperature = 0;
        this.setInteractive();
    }
    move(x: number, y: number) {
        // set lastZone before move
        this.setPosition(x, y);
        if (this.lastZone?.name === 'burner' && this.box.size > 0) {
            this.temperatureEvent.paused = false;
            this.updateColor();
        } else {
            this.temperatureEvent.paused = true;
        }
    }
    increaseTemperature() {
        this.temperature = Math.min(this.temperature + 1, 200);
        this.updateColor();
    }
    updateColor() {
        if (this.temperature > 10) {
            this.tool_text.setColor('#000000');
        } else if (this.temperature > 8) {
            this.tool_text.setColor('#00cc00');
        } else if (this.temperature > 5) {
            this.tool_text.setColor('#00aaff');
        } else {
            this.tool_text.setColor('#cc0000');
        }
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
            color: '#000000',
            fontFamily: 'StudyHard',
        }).setOrigin(0.5).setPadding(10);

        this.add([bg, text]);
    }

    createTools() {
        const x = this.parentContainer.x + this.x;
        const y = this.parentContainer.y + this.y;
        const width = this.width * 0.6;
        const height = this.height * 0.6;
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

        const burner_0 = new Burner(scene, - 7 * width / 16, 0, width / 8, height * 0.7);
        const burner_1 = new Burner(scene, - 5 * width / 16, 0, width / 8, height * 0.7);
        const burner_2 = new Burner(scene, - 3 * width / 16, 0, width / 8, height * 0.7);
        const burner_3 = new Burner(scene, - 1 * width / 16, 0, width / 8, height * 0.7);

        const pot = new ToolShelf(scene, 1 * width / 16, 0, width / 8, height * 0.7, ToolName.POT);
        const steamer = new ToolShelf(scene, 3 * width / 16, 0, width / 8, height * 0.7, ToolName.STEAMER);
        const cup = new ToolShelf(scene, 5 * width / 16, 0, width / 8, height * 0.7, ToolName.CUP);

        const trash = new Trash(scene, 7 * width / 16, 0, width / 8, height * 0.7);

        this.add([burner_0, burner_1, burner_2, burner_3, pot, steamer, cup, trash]);

        [pot, steamer, cup].forEach((toolShelf: ToolShelf) => {
            toolShelf.createTools();
        });
    }
}

export class MainGame extends Scene {
    order_0: Order | undefined;
    order_1: Order | undefined;
    order_2: Order | undefined;
    order_3: Order | undefined;

    constructor() {
        super('MainGame');
    }

    create() {
        const remain_time = 60;

        // 탑바
        // this.add.rectangle(WIDTH / 2, 1 * HEIGHT / 20, WIDTH, 1 * HEIGHT / 10, 0xff00ff, 1).setStrokeStyle(5, 0x000000);
        const top_bar = new TopBar(this, WIDTH / 2, 1 * HEIGHT / 20, WIDTH, 1 * HEIGHT / 10, remain_time);
        // 주문서
        // this.add.rectangle(WIDTH / 2, 5 * HEIGHT / 20, WIDTH, 3 * HEIGHT / 10, 0x00ffff, 1).setStrokeStyle(5, 0x000000);
        this.order_0 = new Order(this, 1 * WIDTH / 8, 5 * HEIGHT / 20, WIDTH / 4, 4 * HEIGHT / 10,
            (price) => top_bar.addEarn(price));
        this.order_1 = new Order(this, 3 * WIDTH / 8, 5 * HEIGHT / 20, WIDTH / 4, 4 * HEIGHT / 10,
            (price) => top_bar.addEarn(price));
        this.order_2 = new Order(this, 5 * WIDTH / 8, 5 * HEIGHT / 20, WIDTH / 4, 4 * HEIGHT / 10,
            (price) => top_bar.addEarn(price));
        this.order_3 = new Order(this, 7 * WIDTH / 8, 5 * HEIGHT / 20, WIDTH / 4, 4 * HEIGHT / 10,
            (price) => top_bar.addEarn(price));
        // 책상
        // this.add.rectangle(WIDTH / 2, 9 * HEIGHT / 20, WIDTH, 1 * HEIGHT / 10, 0xffffff, 1).setStrokeStyle(5, 0x000000);
        new Table(this, WIDTH / 2, 9 * HEIGHT / 20, WIDTH, 1 * HEIGHT / 10);
        // 재료
        this.add.rectangle(WIDTH / 2, 12 * HEIGHT / 20, WIDTH, 2 * HEIGHT / 10, 0xffffff, 1).setStrokeStyle(5, 0x000000);
        new IngredientShelf(this, WIDTH / 2, 12 * HEIGHT / 20, WIDTH, 2 * HEIGHT / 10);
        // 조리
        this.add.rectangle(WIDTH / 2, 17 * HEIGHT / 20, WIDTH, 3 * HEIGHT / 10, 0xffffff, 1).setStrokeStyle(5, 0x000000);
        new Cooking(this, WIDTH / 2, 17 * HEIGHT / 20, WIDTH, 3 * HEIGHT / 10);

        this.order_0.newOrder();
        this.order_1.newOrder();
        this.order_2.newOrder();
        this.order_3.newOrder();

        const game_start = () => {
            console.debug('Game Start!');
            top_bar.startTimer();
            this.input.off('pointerdown', game_start);
        }
        this.input.on('pointerdown', game_start);
    }

    // 주문서 추가 로직
}
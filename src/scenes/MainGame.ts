import { GameObjects, Input, Scene } from 'phaser';
import { FoodName, HEIGHT, IngredientName, PROGRESS_LIST, ToolName, WIDTH } from '../constants';

class TopBar extends GameObjects.Container {
    scene: Scene;

    time_text: GameObjects.Text;
    remain_timer: Phaser.Time.TimerEvent;
    remain_time: number;
    elapsed: number;

    earn_text: GameObjects.Text;

    constructor(scene: Scene, x: number, y:number, width: number, height: number, remain_time: number) {
        super(scene, x, y);
        scene.add.existing(this);
        this.scene = scene;
        this.remain_time = remain_time;
        this.elapsed = 0;
        sessionStorage.setItem('earn', '0');
        // sessionStorage.setItem('earn', '100000');

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

        // 레시피 확인
        const recipe_btn = scene.add.text(0, 0, '레시피 보기', {
            fontSize: height / 1.7,
            color: '#ffffff',
            fontFamily: 'StudyHard',
            stroke: '#000000',
            strokeThickness: 4,
        }).setOrigin(0.5).setInteractive();
        recipe_btn.on('pointerup', () => {
            console.log('click recipe btn');
            scene.scene.launch('Recipe');
        })
        recipe_btn.on('pointerover', () => {
            scene.tweens.add({
                targets: recipe_btn,
                duration: 100,
                scale: 1.1,
            });
        });
        recipe_btn.on('pointerout', () => {
            scene.tweens.add({
                targets: recipe_btn,
                duration: 100,
                scale: 1,
            });
        });
        this.add(recipe_btn);

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
        this.scene.sound.play('pay1', {volume: 0.5});
        const rand = Math.random();
        if (rand < 0.05) this.scene.sound.play('pay3', {volume: 0.5});
        else if (rand < 0.2) this.scene.sound.play('pay4', {volume: 0.5});
        else this.scene.sound.play('pay2', {volume: 0.5});
    }

    static preload(scene: Scene) {
        scene.load.setPath('assets/MainGame');
        scene.load.audio('pay1', 'audio/06.계산.mp3');
        scene.load.audio('pay2', 'audio/thx_0.wav');
        scene.load.audio('pay3', 'audio/voice_7.wav');
        scene.load.audio('pay4', 'audio/voice_9.wav');
        scene.load.image('help', 'help.png');
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
                score -= 3;
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

    static kora_tteokbokki = new Food(FoodName.KORA_TTEOKBOKKI, 4000, 200, ToolName.POT,
        [IngredientName.WATER, IngredientName.RICE_CAKE, IngredientName.SAUCE],
        [IngredientName.FISH_CAKE, IngredientName.SPRING_ONION, IngredientName.EGG, IngredientName.SESAME, IngredientName.NOODLE],
        [[0, -8], [5, 1], [8, 2], [10, -8]]);
    static jako_ramen = new Food(FoodName.JAKO_RAMEN, 4000, 200, ToolName.POT,
        [IngredientName.WATER, IngredientName.NOODLE, IngredientName.RAMEN_SOUP],
        [IngredientName.FISH_CAKE, IngredientName.SPRING_ONION, IngredientName.EGG, IngredientName.SESAME, IngredientName.DUMPLING, IngredientName.RICE_CAKE],
        [[0, -8], [5, 1], [8, 2], [10, -8]]);

    static nande_sundae = new Food(FoodName.NANDE_SUNDAE, 3000, 150, ToolName.STEAMER,
        [IngredientName.WATER, IngredientName.SUNDAE], [],
        [[0, -6], [5, 1], [8, 2], [10, -6]]);
    static daedu_dumpling = new Food(FoodName.DAEDU_DUMPLING, 3000, 150, ToolName.STEAMER,
        [IngredientName.WATER, IngredientName.DUMPLING], [],
        [[0, -6], [5, 1], [8, 2], [10, -6]]);

    static tap_water = new Food(FoodName.TAP_WATER, 1000, 100, ToolName.CUP,
        [IngredientName.WATER], [],
        [[0, 0]]);
    static uru_cider = new Food(FoodName.URU_CIDER, 1000, 100, ToolName.CUP,
        [IngredientName.CIDER], [],
        [[0, 0]]);
    static kora_cola = new Food(FoodName.KORA_COLA, 1000, 100, ToolName.CUP,
        [IngredientName.COLA], [],
        [[0, 0]]);
}
export class Order extends GameObjects.Container {
    text_bg: GameObjects.Image;

    cost_text: GameObjects.Text;
    text: GameObjects.Text;
    requirement_list: Food[] = [];
    tool_list: Tool[] = [];
    cost: number = 0;

    face: GameObjects.Image;
    gender: string = 'man';
    step: number = 6;

    progress: string[] = [];
    progress_timer: Phaser.Time.TimerEvent;
    progress_index: number = 0;

    respawn_timer: Phaser.Time.TimerEvent;

    tap_water_only_flag: boolean = false;

    constructor(scene: Scene, x: number, y:number, width: number, height: number, callback_submit: (price: number) => void) {
        super(scene, x, y);
        scene.add.existing(this);
        this.setSize(width, height);

        this.text_bg = scene.add.image(0, - height / 10, 'talk').setOrigin(0.5);
        this.text_bg.setScale(width / this.text_bg.width, height / this.text_bg.height * 0.7);

        this.cost_text = scene.add.text(0, 3 * height / 20, '+0 치즈', {
            fontSize: height * 0.25,
            color: '#ffffff',
            fontFamily: 'StudyHard',
            stroke: '#000000',
            strokeThickness: 4,
        }).setOrigin(0.5).setPadding(10);
        this.text = scene.add.text(0, - 3 * height / 20, '콘레이', {
            fontSize: height * 0.15,
            color: '#000000',
            fontFamily: 'StudyHard',
            wordWrap: { width: width * 0.9 },
        }).setOrigin(0.5).setPadding(10);
        this.updateText();

        this.face = scene.add.image(0, 7 * height / 20, this.gender + this.step).setOrigin(0.5);
        this.face.setScale(height / this.face.height * 0.7);
        this.initFace();
        this.updateFace();

        const zone = scene.add.zone(0, 0, width, height).setRectangleDropZone(width, height).setName('order');
        zone.setData('order', this);

        this.add([this.cost_text, this.text_bg, this.text, this.face, zone]);

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
                    this.hide = true;
                    this.respawn_timer.paused = false;
                    callback_submit(this.cost);
                    this.cost = 0;
                    this.progress_timer.paused = true;
                }
            },
            loop: true,
            paused: true,
        });
        this.respawn_timer = scene.time.addEvent({
            delay: 1000,
            callback: () => {
                this.newOrder();
            },
            loop: false,
            paused: true,
        });
        this.hide = false;
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
            this.step = Math.min(this.step + 1, 9);
        } else { // 괴식
            if (this.tap_water_only_flag) { // 수돗물단
                this.step = 8;
                this.cost = 9000;
                this.updateFace();
            } else this.step = Math.max(this.step - 1, 0);
        }
        this.updateFace();
        if (this.requirement_list.length == 0) {
            this.cost_text.setText('+' + this.cost.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' 치즈');
            this.progress_timer.paused = false;
            this.scene.sound.play('eat' + Math.floor(Math.random() * 1 + 1), {volume: 0.05});
        } else {
            this.scene.sound.play('ingredient1', {volume: 0.1, seek: 0.15});
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
    initFace() {
        const gender = ['man', 'woman'];
        this.gender = gender[Math.floor(Math.random() * gender.length)];
        this.step = 6;
    }
    updateFace() {
        this.face.setTexture(this.gender + this.step);
        this.face.update();
    }
    randomRequirementList() {
        const requirement_list = [];
        const tap_water_only = sessionStorage.getItem('tap_water_only');
        const food_list = (tap_water_only === 'true') ? [null] : [Food.kora_tteokbokki, Food.jako_ramen, Food.nande_sundae, Food.daedu_dumpling, null, null, null];
        const drink_list = [Food.tap_water, Food.uru_cider, Food.kora_cola, null];
        // const food_list = [Food.kora_tteokbokki];
        // const food_list = [null];
        // const drink_list = [null];
        const food = food_list[Math.floor(Math.random() * food_list.length)];
        const drink = food ? drink_list[Math.floor(Math.random() * drink_list.length)] : Food.tap_water;
        if (food) requirement_list.push(food);
        if (drink) requirement_list.push(drink);
        return requirement_list;
    }
    randomProgress() {
        return PROGRESS_LIST[Math.floor(Math.random() * PROGRESS_LIST.length)];
    }
    newOrder() {
        this.initFace();
        this.updateFace();
        this.requirement_list = this.randomRequirementList();
        this.updateText();

        this.tool_list = [];
        // this.cost = (this.requirement_list[0] === Food.tap_water)? 2000 : 0;
        this.cost = 0;

        this.progress = this.randomProgress();
        this.progress_index = 0;
        this.progress_timer.paused = true;

        this.respawn_timer.reset({
            delay: 1000,
            callback: () => {
                this.newOrder();
            },
            loop: false,
            paused: true,
        });
        this.hide = false;

        this.tap_water_only_flag = (this.requirement_list.length == 1 && this.requirement_list[0] === Food.tap_water);
    }
    set hide(flag: boolean) {
        this.text_bg.visible = !flag;
        this.text.visible = !flag;
        this.face.visible = !flag;
        this.cost_text.visible = flag;
    }

    static preload(scene: Scene) {
        scene.load.setPath('assets/MainGame');
        // 말풍선
        scene.load.image('talk', 'fukidashi_pop06.png');

        scene.load.image('man0', 'face_angry_man5.png');
        scene.load.image('man1', 'face_angry_man4.png');
        scene.load.image('man2', 'face_angry_man3.png');
        scene.load.image('man3', 'face_angry_man2.png');
        scene.load.image('man4', 'face_angry_man1.png');
        scene.load.image('man5', 'face_smile_man1.png');
        scene.load.image('man6', 'face_smile_man2.png');
        scene.load.image('man7', 'face_smile_man3.png');
        scene.load.image('man8', 'face_smile_man4.png');
        scene.load.image('man9', 'face_smile_man5.png');

        scene.load.image('woman0', 'face_angry_woman5.png');
        scene.load.image('woman1', 'face_angry_woman4.png');
        scene.load.image('woman2', 'face_angry_woman3.png');
        scene.load.image('woman3', 'face_angry_woman2.png');
        scene.load.image('woman4', 'face_angry_woman1.png');
        scene.load.image('woman5', 'face_smile_woman1.png');
        scene.load.image('woman6', 'face_smile_woman2.png');
        scene.load.image('woman7', 'face_smile_woman3.png');
        scene.load.image('woman8', 'face_smile_woman4.png');
        scene.load.image('woman9', 'face_smile_woman5.png');

        scene.load.audio('eat1', 'audio/04. 한입.mp3');
    }
}

class Table extends GameObjects.Container {
    constructor(scene: Scene, x: number, y:number, width: number, height: number) {
        super(scene, x, y);
        scene.add.existing(this);

        const table = scene.add.plane(0, height/2, 'wood').setDisplaySize(width * 1.15, height);
        table.rotateX = -30;
        this.add([table]);
    }

    static preload(scene: Scene) {
        scene.load.setPath('assets/MainGame');
        scene.load.image('wood', 'wood_texture.jpg');
    }
}

class Ingredient extends GameObjects.Container {
    returnX: number;
    returnY: number;

    constructor(scene: Scene, x: number, y:number, width: number, height: number, name: IngredientName) {
        super(scene, x, y);
        scene.add.existing(this);
        this.returnX = x;
        this.returnY = y;
        this.name = name;
        
        // const bg = scene.add.rectangle(0, 0, width, height, 0xffffff).setOrigin(0.5).setStrokeStyle(5, 0x000000);
        const image = scene.add.image(0, 0, name).setScale(0.45);
        const text = scene.add.text(0, 0, name, {
            fontSize: height * 0.7,
            color: '#000000',
            fontFamily: 'StudyHard',
            stroke: '#ffffff',
            strokeThickness: 2,
        }).setOrigin(0.5).setPadding(10);

        this.add([image, text]);

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

    static preload(scene: Scene) {
        scene.load.setPath('assets/MainGame');
        scene.load.audio('ingredient1', 'audio/20. 불쑥.mp3');
        scene.load.image('empty', 'empty.png');
        scene.load.image(IngredientName.RICE_CAKE, 'rice_cake.png');
        scene.load.image(IngredientName.NOODLE, 'noodle.png');
        scene.load.image(IngredientName.SAUCE, 'sauce.png');
        scene.load.image(IngredientName.RAMEN_SOUP, 'soup.png');
        scene.load.image(IngredientName.FISH_CAKE, 'fish_cake.png');
        scene.load.image(IngredientName.EGG, 'egg.png');
        scene.load.image(IngredientName.SPRING_ONION, 'spring_onion.png');
        scene.load.image(IngredientName.SESAME, 'sesame.png');
        scene.load.image(IngredientName.SUNDAE, 'sundae.png');
        scene.load.image(IngredientName.DUMPLING, 'dumpling.png');
    }
}
class IngredientPosition extends GameObjects.Container {
    width: number;
    height: number;
    name: IngredientName;
    
    constructor(scene: Scene, x: number, y:number, width: number, height: number, name: IngredientName) {
        super(scene, x, y);
        scene.add.existing(this);
        this.width = width;
        this.height = height;
        this.name = name;
        const bg = scene.add.image(0, height / 8, 'tray').setScale(0.28);
        this.add(bg)
    }

    createIngredients() {
        const x = this.parentContainer.x + this.x;
        const y = this.parentContainer.y + this.y;
        const width = this.width * 0.8;
        const height = this.height * 0.8;
        new Ingredient(this.scene, x, y, width, height, this.name);
        new Ingredient(this.scene, x, y, width, height, this.name);
    }

    static preload(scene: Scene) {
        scene.load.setPath('assets/MainGame');
        scene.load.image('tray', 'tray.png');
    }
}
class Tap extends GameObjects.Container {
    constructor(scene: Scene, x: number, y:number, width: number, height: number, name: string) {
        super(scene, x, y);
        scene.add.existing(this);
        this.name = name;
        
        // const bg = scene.add.rectangle(0, 0, width, height, 0xffffff).setOrigin(0.5);
        const tap = scene.add.image(0, - height / 10, 'tap').setScale(0.8);
        const below = scene.add.image(0, 0, 'below');
        const text = scene.add.text(0, height/20, name, {
            fontSize: height / 3,
            color: '#000000',
            fontFamily: 'StudyHard',
            stroke: '#ffffff',
            strokeThickness: height / 30,
        }).setOrigin(0.5).setPadding(10);
        const zone = scene.add.zone(0, 0, width, height).setRectangleDropZone(width, height).setName('tap');
        zone.setData('tool', null);

        // this.add([bg, text, zone]);
        this.add([text, zone]);
        this.add([tap, below]);
    }

    static preload(scene: Scene) {
        scene.load.setPath('assets/MainGame');
        scene.load.image('tap', 'dispenser_tap.png');
        scene.load.image('below', 'dispenser_below.png');
    }
}
class IngredientShelf extends GameObjects.Container {
    constructor(scene: Scene, x: number, y:number, width: number, height: number) {
        super(scene, x, y);
        scene.add.existing(this);

        const rice_cake = new IngredientPosition(scene, - 7 * width / 16, - height / 4, width / 8, height / 2, IngredientName.RICE_CAKE);
        const sauce = new IngredientPosition(scene, - 5 * width / 16,  - height / 4, width / 8, height / 2, IngredientName.SAUCE);
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

        const burner_image = scene.add.image(0, 0, 'aaa').setOrigin(0.5, 0).setScale(0.7);
        const zone = scene.add.zone(0, 0, width, height).setRectangleDropZone(width, height).setName('burner');
        zone.setData('tool', null);

        this.add([burner_image, zone]);
    }

    static preload(scene: Scene) {
        scene.load.setPath('assets/MainGame');
        scene.load.image('aaa', 'burner.png');
    }
}
class Trash extends GameObjects.Container {
    trash_image: GameObjects.Image;
    constructor(scene: Scene, x: number, y:number, width: number, height: number) {
        super(scene, x, y);
        scene.add.existing(this);

        this.trash_image = scene.add.image(0, 0, 'trash_close').setScale(0.25);
        const zone = scene.add.zone(0, 0, width, height).setRectangleDropZone(width, height).setName('trash');
        zone.setData('open', () => {
            this.trash_image.setTexture('trash_open');
        });
        zone.setData('close', () => {
            this.trash_image.setTexture('trash_close');
        });

        this.add([this.trash_image, zone]);
    }

    static preload(scene: Scene) {
        scene.load.setPath('assets/MainGame');
        scene.load.image('trash_open', 'trash_open.png');
        scene.load.image('trash_close', 'trash_close.png');
    }
}
class Tool extends GameObjects.Container {
    scene: Scene;
    name: ToolName;

    toolX: number;
    toolY: number;
    returnX: number;
    returnY: number;
    lastZone: GameObjects.Zone | null = null;

    tool_image: Record<string, GameObjects.Image> = {};
    box: Set<string> = new Set<string>();

    fire_image: GameObjects.Image;
    vapor_image: GameObjects.Image;
    temperature: number;
    temperatureEvent: Phaser.Time.TimerEvent;

    constructor(scene: Scene, x: number, y:number, width: number, height: number, name: ToolName) {
        super(scene, x, y);
        scene.add.existing(this);
        this.scene = scene;
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

        this.tool_image['empty'] = scene.add.image(0, - height / 4, 'empty').setScale(0.35);
        this.tool_image[ToolName.CUP] = scene.add.image(0, 0, 'cup').setOrigin(0.5, 0.3).setScale(0.15).setAlpha(0.9);
        this.tool_image['cup_water'] = scene.add.image(0, 0, 'cup_water').setOrigin(0.5, 0.3).setScale(0.15).setAlpha(0.9);
        this.tool_image['cup_cider'] = scene.add.image(0, 0, 'cup_cider').setOrigin(0.5, 0.3).setScale(0.15).setAlpha(0.9);
        this.tool_image['cup_cola'] = scene.add.image(0, 0, 'cup_cola').setOrigin(0.5, 0.3).setScale(0.15).setAlpha(0.9);
        this.tool_image['cup_fail'] = scene.add.image(0, 0, 'cup_fail').setOrigin(0.5, 0.3).setScale(0.15).setAlpha(0.9);

        this.tool_image[ToolName.POT] = scene.add.image(0, 0, 'pot_bg').setOrigin(0.5, 0.3).setScale(0.3);
        this.tool_image[IngredientName.RICE_CAKE] = scene.add.image(-width/6, height/8, IngredientName.RICE_CAKE).setScale(0.3);
        this.tool_image[IngredientName.NOODLE] = scene.add.image(0, height/8, IngredientName.NOODLE).setScale(0.35);
        this.tool_image[IngredientName.FISH_CAKE] = scene.add.image(width/6, height/8, IngredientName.FISH_CAKE).setScale(0.35);
        this.tool_image['water_blue'] = scene.add.image(0, height/6, 'pot_water').setScale(0.3);
        this.tool_image['water_red'] = scene.add.image(0, height/6, 'pot_water_red').setScale(0.3);
        this.tool_image['water_orange'] = scene.add.image(0, height/6, 'pot_water_orange').setScale(0.3);
        this.tool_image[IngredientName.SPRING_ONION] = scene.add.image(-width/8, height/16, 'spring_onion_topping').setScale(0.1);
        this.tool_image[IngredientName.SESAME] = scene.add.image(0, 0, 'sesame_topping').setScale(0.2);
        this.tool_image[IngredientName.EGG] = scene.add.image(width/6, 0, IngredientName.EGG).setScale(0.2);
        this.tool_image['pot_fail'] = scene.add.image(0, 0, 'failed_food').setScale(0.35);
        this.tool_image['pot_front'] = scene.add.image(0, 0, 'pot_front').setOrigin(0.5, 0.3).setScale(0.3);

        this.tool_image[ToolName.STEAMER] = scene.add.image(0, 0, 'steamer').setOrigin(0.5, 0.5).setScale(0.25);
        this.tool_image['steamer_water'] = scene.add.image(0, 0, 'steamer_water').setOrigin(0.5, 0.5).setScale(0.25);
        this.tool_image[IngredientName.SUNDAE] = scene.add.image(0, - height / 2.5, 'sundae').setScale(0.35);
        this.tool_image[IngredientName.DUMPLING] = scene.add.image(0, - height / 2.5, 'dumpling').setScale(0.35);
        this.tool_image['steamer_fail'] = scene.add.image(0, - height / 2.5, 'failed_food').setScale(0.35);

        this.tool_image['food'] =  scene.add.image(0, 0, 'empty').setOrigin(0.5, 0.2).setScale(0.3);
        this.updateToolImage();

        this.fire_image = scene.add.image(0, 0, 'burner_fire').setOrigin(0.5, 0.0).setScale(0.8);
        this.heating = false;
        this.vapor_image = scene.add.image(0, -height/2, 'empty').setOrigin(0.5).setScale(0.3);
        if (this.name === ToolName.STEAMER) this.vapor_image.setY(-height/1.2);

        for(let ingredient_name in this.tool_image) {
            this.add(this.tool_image[ingredient_name]);
        }
        this.add([this.fire_image, this.vapor_image]);

        this.setSize(width, height).setInteractive({ draggable: true });
        this.on('dragstart', (pointer: Input.Pointer) => {
            scene.children.bringToTop(this);
            this.heating = false;
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
                    scene.sound.play('trash', {volume: 0.3});
                    dropZone.getData('close')();
                    break;
                case 'order':
                    if (this.name === ToolName.CUP && this.box.size == 0) {
                        this.move(this.returnX, this.returnY);
                    } else if ((this.name === ToolName.POT || this.name === ToolName.STEAMER) && this.temperature == 0){
                        this.move(this.returnX, this.returnY);
                    } else {
                        this.lastZone?.setData('tool', null);
                        this.lastZone = dropZone;
                        this.updateFoodImage();
                        this.vapor_image.setTexture('empty');
                        dropZone.getData('order').submit(this);
                    }
                    break;
                default:
                    break;
            }
        });
        this.on('dragenter', (pointer: Input.Pointer, dropZone: GameObjects.GameObject) => {
            if (dropZone.name === 'trash') dropZone.getData('open')();
        });
        this.on('dragleave', (pointer: Input.Pointer, dropZone: GameObjects.GameObject) => {
            if (dropZone.name === 'trash') dropZone.getData('close')();
        });
    }

    putIngredient(ingredient: string) {
        this.box.add(ingredient);
        this.move(this.returnX, this.returnY);
        this.scene.sound.play('tap1', {volume: 0.4});
        this.updateToolImage();
    }
    updateImage(name: string, exclusive: boolean = true) {
        if (exclusive) {
            for(let key in this.tool_image) {
                this.hideImage(key);
            }
        }
        this.tool_image[name].visible = true;
    }
    hideImage(name: string) {
        this.tool_image[name].visible = false;
    }
    updateCupImage() {
        if (this.box.size == 0) this.updateImage(ToolName.CUP);
        else if (this.box.size == 1 && this.box.has(IngredientName.WATER)) this.updateImage('cup_water');
        else if (this.box.size == 1 && this.box.has(IngredientName.CIDER)) this.updateImage('cup_cider');
        else if (this.box.size == 1 && this.box.has(IngredientName.COLA)) this.updateImage('cup_cola');
        else this.updateImage('cup_fail');
    }
    updatePotImage() {
        if (this.box.size == 0) {
            this.updateImage(this.name);
            this.updateImage('pot_front', false);
        }

        if (this.box.has(IngredientName.SUNDAE) || this.box.has(IngredientName.DUMPLING) || this.box.has(IngredientName.CIDER) || this.box.has(IngredientName.COLA)) {
            this.updateImage('pot_fail', false);
            return;
        }
        if (this.box.has(IngredientName.SAUCE) && this.box.has(IngredientName.RAMEN_SOUP)) {
            this.updateImage('pot_fail', false);
            return;
        }
        if (this.temperature > 10) {
            this.updateImage('pot_fail', false);
            return;
        }

        if (this.box.has(IngredientName.WATER) && !this.box.has(IngredientName.SAUCE) && !this.box.has(IngredientName.RAMEN_SOUP)) {
            this.updateImage('water_blue', false);
        } else if (this.box.has(IngredientName.WATER) && this.box.has(IngredientName.SAUCE) && !this.box.has(IngredientName.RAMEN_SOUP)) {
            this.hideImage('water_blue');
            this.updateImage('water_red', false);
        } else if (this.box.has(IngredientName.WATER) && !this.box.has(IngredientName.SAUCE) && this.box.has(IngredientName.RAMEN_SOUP)) {
            this.hideImage('water_blue');
            this.updateImage('water_orange', false);
        }
        for (let ingredient_name of this.box) {
            if ([IngredientName.WATER, IngredientName.SAUCE, IngredientName.RAMEN_SOUP].includes(ingredient_name)) continue;
            this.updateImage(ingredient_name, false);
        }
    }
    updateSteamerImage() {
        if (this.temperature > 10) {
            this.updateImage(this.name);
            this.updateImage('steamer_fail', false);
            return;
        }
        if (this.box.size == 0) this.updateImage(this.name);
        else if (this.box.size == 1 && this.box.has(IngredientName.WATER)) this.updateImage('steamer_water');
        else if (this.box.size == 1 && this.box.has(IngredientName.DUMPLING)) this.updateImage(IngredientName.DUMPLING, false);
        else if (this.box.size == 1 && this.box.has(IngredientName.SUNDAE)) this.updateImage(IngredientName.SUNDAE, false);
        else if (this.box.size == 2 && this.box.has(IngredientName.WATER) && this.box.has(IngredientName.DUMPLING)) {
            this.updateImage('steamer_water');
            this.updateImage(IngredientName.DUMPLING, false);
        } else if (this.box.size == 2 && this.box.has(IngredientName.WATER) && this.box.has(IngredientName.SUNDAE)) {
            this.updateImage('steamer_water');
            this.updateImage(IngredientName.SUNDAE, false);
        } else {
            this.updateImage(this.name);
            this.updateImage('steamer_fail', false);
        }
    }
    updateToolImage() {
        if (this.name === ToolName.CUP) this.updateCupImage();
        else if (this.name === ToolName.POT) this.updatePotImage();
        else if (this.name === ToolName.STEAMER) this.updateSteamerImage();
    }
    updateFoodImage() {
        let food_name = '괴식';
        if (this.temperature <= 10) {
            if (this.name == ToolName.POT) {
                if (this.box.size >= 3 && this.box.has(IngredientName.WATER)) {
                    if (this.box.has(IngredientName.SAUCE) && this.box.has(IngredientName.RAMEN_SOUP)) food_name = '괴식';
                    else if (this.box.has(IngredientName.SAUCE) && this.box.has(IngredientName.RICE_CAKE)) food_name = FoodName.KORA_TTEOKBOKKI;
                    else if (this.box.has(IngredientName.RAMEN_SOUP) && this.box.has(IngredientName.NOODLE)) food_name = FoodName.JAKO_RAMEN;
                }
            } else if (this.name == ToolName.STEAMER) {
                if (this.box.size == 2 && this.box.has(IngredientName.WATER)) {
                    if (this.box.has(IngredientName.DUMPLING)) food_name = FoodName.DAEDU_DUMPLING;
                    else if (this.box.has(IngredientName.SUNDAE)) food_name = FoodName.NANDE_SUNDAE;
                }
            } else return;
        }
        this.tool_image['food'].setTexture(food_name);
        this.updateImage('food');
    }
    returnTool() {
        this.lastZone?.setData('tool', null);
        this.lastZone = null;
        this.returnX = this.toolX;
        this.returnY = this.toolY;
        this.move(this.returnX, this.returnY);
        this.box.clear();
        this.temperature = 0;
        this.vapor_image.setTexture('empty')
        this.setInteractive();
        this.updateToolImage();
    }
    set heating(flag: boolean) {
        if (this.temperatureEvent.paused && flag) this.scene.sound.play('fire1', {volume: 0.7, seek: 0.2});
        this.temperatureEvent.paused = !flag;
        this.fire_image.visible = flag;
    }
    move(x: number, y: number) {
        // set lastZone before move
        this.setPosition(x, y);
        if (this.lastZone?.name === 'burner' && this.box.size > 0) {
            this.heating = true;
        } else {
            this.heating= false;
        }
    }
    increaseTemperature() {
        this.temperature = Math.min(this.temperature + 1, 200);
        if (this.temperature > 10) this.vapor_image.setTexture('vapor_4');
        else if (this.temperature > 8) this.vapor_image.setTexture('vapor_3');
        else if (this.temperature > 5) this.vapor_image.setTexture('vapor_2');
        else if (this.temperature > 0) this.vapor_image.setTexture('vapor_1');
        if (this.temperature == 11) this.scene.sound.play('fizz', {volume: 0.4, seek: 0.3});
        this.updateToolImage();
    }

    static preload(scene: Scene) {
        scene.load.setPath('assets/MainGame');
        scene.load.audio('fire1', 'audio/22. 중간 훅.wav');
        scene.load.audio('fire2', 'audio/23. 중간 훅2.wav');
        scene.load.audio('trash', 'audio/13.훅.mp3');
        scene.load.audio('tap1', 'audio/09. 뿅.mp3');
        scene.load.audio('tap2', 'audio/18. 뾱.mp3');

        scene.load.image('cup', 'amount_water_glass1.png');
        scene.load.image('cup_water', 'amount_water_glass3.png');
        scene.load.image('cup_cider', 'soda6_skyblue.png');
        scene.load.image('cup_cola', 'soda8_purple.png');
        scene.load.image('cup_fail', 'cup_fail.png');

        scene.load.image('pot_front', 'pot_front.png');
        scene.load.image('pot_bg', 'pot_bg.png');
        scene.load.image('pot_water', 'pot_water.png');
        scene.load.image('pot_water_red', 'pot_water_red.png');
        scene.load.image('pot_water_orange', 'pot_water_orange.png');
        scene.load.image('spring_onion_topping', 'spring_onion_topping.png');
        scene.load.image('sesame_topping', 'sesame_topping.png');
        
        scene.load.image('steamer', 'steamer.png');
        scene.load.image('steamer_water', 'steamer_water.png');
        scene.load.image('empty', 'empty.png');
        scene.load.image('dumpling', 'dumpling.png');
        scene.load.image('sundae', 'sundae.png');
        scene.load.image('failed_food', 'failed_food.png');

        scene.load.image(FoodName.KORA_TTEOKBOKKI, '떡볶이.png');
        scene.load.image(FoodName.JAKO_RAMEN, '라면.png');
        scene.load.image(FoodName.DAEDU_DUMPLING, '만두.png');
        scene.load.image(FoodName.NANDE_SUNDAE, '순대.png');
        scene.load.image('괴식', '괴식.png');

        scene.load.image('burner_fire', 'burner_fire.png');
        scene.load.image('vapor_1', 'vapor_1.png');
        scene.load.image('vapor_2', 'vapor_2.png');
        scene.load.image('vapor_3', 'vapor_3.png');
        scene.load.image('vapor_4', 'vapor_4.png');
        scene.load.audio('fizz', 'audio/fizz.mp3');
    }
}
class ToolShelf extends GameObjects.Container {
    scene: Scene;
    width: number;
    height: number;
    name: ToolName;

    constructor(scene: Scene, x: number, y:number, width: number, height: number, name: ToolName) {
        super(scene, x, y);
        scene.add.existing(this);
        this.scene = scene;
        this.width = width;
        this.height = height;
        this.name = name;
        
        // const bg = scene.add.rectangle(0, 0, width, height, 0xffffff).setOrigin(0.5).setStrokeStyle(5, 0x000000);
        // const text = scene.add.text(0, 0, name, {
        //     fontSize: height / 2,
        //     color: '#000000',
        //     fontFamily: 'StudyHard',
        // }).setOrigin(0.5).setPadding(10);

        // this.add([bg, text]);
        // this.add([text]);
    }

    createTools() {
        const width = this.width * 0.75;
        const height = this.height * 0.75;
        const x = this.parentContainer.x + this.x;
        const y = this.parentContainer.y + this.y - height * 0.1;
        new Tool(this.scene, x, y, width, height, this.name);
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
        // const remain_time = 3;

        const background = this.add.image(WIDTH/2, HEIGHT/2 - HEIGHT/7, 'background').setOrigin(0.5);
        background.setScale(Math.max(WIDTH / background.width, HEIGHT / background.height));
        background.preFX?.addBlur(0, 2, 2, 1);

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
        this.add.rectangle(WIDTH / 2, 12 * HEIGHT / 20, WIDTH, 2 * HEIGHT / 10, 0xa0a6c1, 1);
        this.add.rectangle(WIDTH / 2, 17 * HEIGHT / 20, WIDTH, 3 * HEIGHT / 10, 0xa0a6c1, 1);
        new IngredientShelf(this, WIDTH / 2, 12 * HEIGHT / 20, WIDTH, 2 * HEIGHT / 10);
        // 조리
        // this.add.rectangle(WIDTH / 2, 17 * HEIGHT / 20, WIDTH, 3 * HEIGHT / 10, 0xffffff, 1);
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
        this.input.on('pointerup', game_start);
        // this.scene.launch('Recipe');
    }

    static preload(scene: Scene) {
        scene.load.setPath('assets/MainGame');
        scene.load.image('background', 'background.jpg');
        TopBar.preload(scene);
        Order.preload(scene);
        Tool.preload(scene);
        Table.preload(scene);
        Ingredient.preload(scene);
        Tap.preload(scene);
        Burner.preload(scene);
        IngredientPosition.preload(scene);
        Trash.preload(scene);
    }
}
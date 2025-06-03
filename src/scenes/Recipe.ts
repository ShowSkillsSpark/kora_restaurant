import { Scene } from "phaser";
import { FoodName, HEIGHT, IngredientName, ToolName, WIDTH } from "../constants";

export class Recipe extends Scene {
    constructor() {
        super("Recipe");
    }

    create() {
        // background
        this.add.rectangle(WIDTH/2, HEIGHT/2, WIDTH, HEIGHT, 0xffffff, 0.7).setOrigin(0.5);
        // text_background
        this.add.graphics().fillStyle(0xffffff, 1).fillRoundedRect(WIDTH / 10, HEIGHT / 10, WIDTH * 8 / 10, HEIGHT * 8 / 10, HEIGHT / 30).setDepth(0);
        // text region
        this.add.text(WIDTH*0.2, HEIGHT*0.15, `${FoodName.KORA_TTEOKBOKKI}: ${ToolName.POT} + ${IngredientName.WATER} + ${IngredientName.RICE_CAKE} + ${IngredientName.SAUCE} [+ 갖은 양념]\n${FoodName.JAKO_RAMEN}: ${ToolName.POT} + ${IngredientName.WATER} + ${IngredientName.NOODLE} + ${IngredientName.RAMEN_SOUP} [+ 갖은 양념]\n\n${FoodName.NANDE_SUNDAE}: ${ToolName.STEAMER} + ${IngredientName.WATER} + ${IngredientName.SUNDAE}\n${FoodName.DAEDU_DUMPLING}: ${ToolName.STEAMER} + ${IngredientName.WATER} + ${IngredientName.DUMPLING}\n\n${FoodName.TAP_WATER}: ${ToolName.CUP} + ${IngredientName.WATER}\n${FoodName.URU_CIDER}: ${ToolName.CUP} + ${IngredientName.CIDER}\n${FoodName.KORA_COLA}: ${ToolName.CUP} + ${IngredientName.COLA}`, {
            fontSize: HEIGHT / 18,
            color: '#000000',
            fontFamily: 'StudyHard',
        });
        this.add.zone(WIDTH/2, HEIGHT/2, WIDTH, HEIGHT).setOrigin(0.5).setInteractive(); // 클릭 방지
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
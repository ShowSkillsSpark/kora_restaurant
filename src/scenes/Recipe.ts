import { Scene } from "phaser";
import { FoodName, HEIGHT, IngredientName, ToolName, WIDTH } from "../constants";

export class Recipe extends Scene {
    constructor() {
        super("Recipe");
    }

    create() {
        this.add.text(0, 0, `${FoodName.KORA_TTEOKBOKKI}: ${ToolName.POT} + ${IngredientName.WATER} + ${IngredientName.RICE_CAKE} + ${IngredientName.SAUCE} [+ 갖은 양념]\n${FoodName.JAKO_RAMEN}: ${ToolName.POT} + ${IngredientName.WATER} + ${IngredientName.NOODLE} + ${IngredientName.RAMEN_SOUP} [+ 갖은 양념]\n\n${FoodName.NANDE_SUNDAE}: ${ToolName.STEAMER} + ${IngredientName.WATER} + ${IngredientName.SUNDAE}\n${FoodName.DAEDU_DUMPLING}: ${ToolName.STEAMER} + ${IngredientName.WATER} + ${IngredientName.DUMPLING}\n\n${FoodName.TAP_WATER}: ${ToolName.CUP} + ${IngredientName.WATER}\n${FoodName.URU_CIDER}: ${ToolName.CUP} + ${IngredientName.CIDER}\n${FoodName.KORA_COLA}: ${ToolName.CUP} + ${IngredientName.COLA}`, {
            fontSize: HEIGHT / 24,
            color: '#000000',
            fontFamily: 'StudyHard',
        });
        // 돌아가기
        const back_text = this.add.text(WIDTH / 2, 3 * HEIGHT/4, '돌아가기', {
            fontSize: HEIGHT / 8,
            color: '#ff0000',
            fontFamily: 'StudyHard',
        }).setOrigin(0.5);

        back_text.setInteractive();
        back_text.on('pointerup', () => {
            this.sound.play('tap1', {volume: 0.4});
            this.scene.start('MainMenu');
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
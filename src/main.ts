import { CustomLoadingScene } from "./common/custonLoadingScene";
import { GameScene } from "./game_scene/gameScene";
import { GameMainParameterObject } from "./parameterObject";
import { TitleScene } from "./title_scene.ts/titleScene";

export function main(param: GameMainParameterObject): void {
    g.game.vars.gameState = {
        score: 0,
        playThreshold: 100,
        clearThreshold: undefined,
    };
    g.game.audio.music.volume = 0.15;
    g.game.audio.sound.volume = 0.5;
    g.game.loadingScene = new CustomLoadingScene();

    const titleScene = new TitleScene(7, () => {
        g.game.replaceScene(new GameScene(param, 60));
    });
    g.game.pushScene(titleScene);
}

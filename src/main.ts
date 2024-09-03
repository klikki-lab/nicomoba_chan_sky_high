import { CustomLoadingScene } from "./common/customLoadingScene";
import { SceneDuration } from "./common/sceneDuration";
import { GameScene } from "./game_scene/gameScene";
import { GameMainParameterObject } from "./parameterObject";
import { TitleScene } from "./title_scene.ts/titleScene";

export function main(param: GameMainParameterObject): void {
    g.game.vars.gameState = {
        score: 0,
        playThreshold: 100,
        clearThreshold: undefined,
    };
    g.game.audio.music.volume = 0.2;
    g.game.audio.sound.volume = 0.5;
    g.game.loadingScene = new CustomLoadingScene();

    const titleScene = new TitleScene(SceneDuration.TITLE);
    titleScene.onFinish = (): void => g.game.replaceScene(new GameScene(param, SceneDuration.GAME));
    g.game.pushScene(titleScene);
}

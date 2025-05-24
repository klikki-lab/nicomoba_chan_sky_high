import { CustomLoadingScene } from "./common/customLoadingScene";
import { SceneDuration } from "./common/sceneDuration";
import { WindowUtil } from "./common/windowUtil";
import { GameScene } from "./game_scene/gameScene";
import { GameMainParameterObject } from "./parameterObject";
import { TitleScene } from "./title_scene/titleScene";

export function main(param: GameMainParameterObject): void {
    g.game.vars.gameState = {
        score: 0,
        playThreshold: 100,
        clearThreshold: undefined,
    };

    const isNicovideoJpDomain = WindowUtil.isNicoNicoDomain();
    const musicVolume = 0.2 * (isNicovideoJpDomain ? 1 : 0.25);
    const soundVolume = 0.5 * (isNicovideoJpDomain ? 1 : 0.25);
    g.game.audio.music.volume = musicVolume;
    g.game.audio.sound.volume = soundVolume;
    g.game.loadingScene = new CustomLoadingScene();

    const titleScene = new TitleScene(SceneDuration.TITLE);
    titleScene.onFinish = (): void => g.game.replaceScene(new GameScene(param, SceneDuration.GAME));
    g.game.pushScene(titleScene);
}

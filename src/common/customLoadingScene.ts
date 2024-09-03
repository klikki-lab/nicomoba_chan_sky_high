import { Background } from "../game_scene/background";

export class CustomLoadingScene extends g.LoadingScene {

    constructor() {
        super({ game: g.game, assetIds: ["img_landscape"] });

        this.onLoad.add(() => {
            new g.FilledRect({
                scene: this,
                parent: this,
                width: g.game.width,
                height: g.game.height,
                cssColor: `rgb(0,0,${Background.DEFAULT_SKY_COLOR})`,
            });

            const landscape = new g.Sprite({
                scene: this,
                src: this.asset.getImageById("img_landscape"),
                anchorX: 0.5,
                anchorY: 0.5,
            });
            landscape.moveTo(g.game.width * 0.5, g.game.height - landscape.height * 0.25);
            this.append(landscape);
        });
    }
}
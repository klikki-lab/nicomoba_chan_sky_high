import { Background } from "../game_scene/background";

export class CustomLoadingScene extends g.LoadingScene {

    constructor() {
        super({ game: g.game });

        new g.FilledRect({
            scene: this,
            parent: this,
            width: g.game.width,
            height: g.game.height,
            cssColor: `black`,
        });
    }
}
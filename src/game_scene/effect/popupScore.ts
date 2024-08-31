export class PopupScore extends g.Label {

    constructor(scene: g.Scene, font: g.BitmapFont, score: number, pos: g.CommonOffset) {
        super({
            scene: scene,
            font: font,
            fontSize: font.size * .3,
            text: score.toString(),
            x: pos.x,
            y: pos.y,
            anchorX: .5,
            anchorY: .5,
        });

        let lifeTime = g.game.fps * .5;
        this.onUpdate.add((): void | boolean => {
            if (lifeTime-- <= 0) {
                this.destroy();
                return true;
            }
        });
    }
}
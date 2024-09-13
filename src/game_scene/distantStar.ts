export class DistantStar extends g.FilledRect {

    constructor(scene: g.Scene, size: number = g.game.random.generate() * 2 + 1) {
        super({
            scene: scene,
            width: size,
            height: size,
            cssColor: "white",
            anchorX: 0.5,
            anchorY: 0.5,
            opacity: 0.75,
            angle: g.game.random.generate() * 360,
            x: g.game.random.generate() * (g.game.width * 0.9) + g.game.width * 0.05,
            y: g.game.random.generate() * (g.game.height * 0.9) + g.game.height * 0.05,
        });

        if (size > 2.8) {
            const lightSize = g.game.random.generate() * 3 + size * 4
            for (let j = 0; j < 2; j++) {
                new g.FilledRect({
                    scene: scene,
                    parent: this,
                    width: j * lightSize + size / 2,
                    height: (1 - j) * lightSize + size / 2,
                    cssColor: "white",
                    anchorX: 0.5,
                    anchorY: 0.5,
                    opacity: 0.5,
                    x: this.width / 2,
                    y: this.height / 2,
                });
            }
        }
    }
}
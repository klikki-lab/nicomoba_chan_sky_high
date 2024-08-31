export class Background extends g.FilledRect {

    static readonly DEFAULT_SKY_COLOR = 0x60;

    constructor(scene: g.Scene, index: number, colorRate: number) {
        super({
            scene: scene,
            width: g.game.width,
            height: g.game.height + 1,
            y: -g.game.height * (index + 1),
            cssColor: `rgb(0,0,${Background.DEFAULT_SKY_COLOR * colorRate})`,
        });
    }

    override render(renderer: g.Renderer, camera?: g.Camera): void {
        if (camera instanceof g.Camera2D) {
            if ((camera.y >= this.y && camera.y <= this.y + this.height) ||
                (camera.y + g.game.height >= this.y && camera.y <= this.y)) {
                super.render(renderer, camera);
            }
        }
    }
}
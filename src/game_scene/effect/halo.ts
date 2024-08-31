export class Halo extends g.Sprite {

    constructor(scene: g.Scene, parent: g.Scene | g.E, pos: g.CommonOffset) {
        super({
            scene: scene,
            parent: parent,
            src: scene.asset.getImageById("img_halo"),
            anchorX: 0.5,
            anchorY: 0.5,
            angle: g.game.random.generate() * 360,
            x: pos.x,
            y: pos.y,
        });
    }

    override render(renderer: g.Renderer, camera?: g.Camera): void {
        if (camera instanceof g.Camera2D) {
            if (this.y <= camera.y + g.game.height + this.height && this.y >= camera.y - this.height) {
                super.render(renderer, camera);
                if (!this.onUpdate.contains(this.updateHandler)) {
                    this.onUpdate.add(this.updateHandler);
                }
            } else {
                if (this.onUpdate.contains(this.updateHandler)) {
                    this.onUpdate.remove(this.updateHandler);
                }
            }
        }
    }

    private updateHandler = (): void | boolean => {
        this.angle += 2;
        if (this.angle >= 360) {
            this.angle -= 360;
        }
        this.modified();
    };
}
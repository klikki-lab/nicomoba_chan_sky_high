export class StarFragment extends g.Sprite {

    velocity: g.CommonOffset = { x: 0, y: 0 };
    private rotationSpeed: number;

    constructor(scene: g.Scene, pos: g.CommonOffset, isRainbowStar: boolean) {
        super({
            scene: scene,
            src: scene.asset.getImageById(isRainbowStar ? "img_rainbow_star" : "img_star"),
            anchorX: 0.5,
            anchorY: 0.5,
            x: pos.x,
            y: pos.y,
        });
        this.rotationSpeed = g.game.random.generate() * 10 + 10;

        this.onUpdate.add(this.updateHandler);
    }

    private updateHandler = (): void | boolean => {
        if (Math.abs(this.velocity.x) > 0.01) {
            this.x += this.velocity.x;
            this.velocity.x *= 0.9;
        }
        if (Math.abs(this.velocity.y) > 0.01) {
            this.y += this.velocity.y;
            this.velocity.y *= 0.9;
        }
        this.opacity *= 0.95;
        this.angle += this.rotationSpeed;
        if (this.angle >= 360) {
            this.angle -= 360;
        }
        this.modified();

        if (this.opacity < 0.1) {
            this.destroy(true);
        }
    };
}
export abstract class Collisionable extends g.Sprite {

    override render(renderer: g.Renderer, camera?: g.Camera): void {
        if (camera instanceof g.Camera2D) {
            if (this.y <= camera.y + g.game.height + this.width && this.y >= camera.y - this.height) {
                super.render(renderer, camera);
            }
            return;
        }
        super.render(renderer, camera);
    }
} 
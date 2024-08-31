import { Collisionable } from "./collisionable";

export class Star extends Collisionable {

    static readonly SIZE = 32;

    private relightSec: number = 0;

    constructor(scene: g.Scene, pos?: g.CommonOffset, assetId: string = "img_star") {
        super({
            scene: scene,
            src: scene.asset.getImageById(assetId),
            anchorX: 0.5,
            anchorY: 0.5,
            angle: g.game.random.generate() * 360,
            x: pos ? pos.x : 0,
            y: pos ? pos.y : 0,
        });
    }

    turnOff(relightSec: number): void {
        this.relightSec = relightSec;
        this.onUpdate.add(this.updateHandler);
        this.hide();
    }

    private updateHandler = (): void | boolean => {
        if (this.relightSec-- <= 0) {
            this.show();
            return true;
        }
    };
}
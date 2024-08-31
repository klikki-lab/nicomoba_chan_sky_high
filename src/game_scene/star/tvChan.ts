import { Halo } from "../effect/halo";
import { Collisionable } from "./collisionable";

export class TvChan extends Collisionable {

    constructor(scene: g.Scene, private halo: Halo, pos: g.CommonOffset) {
        super({
            scene: scene,
            src: scene.asset.getImageById("tv_chan"),
            anchorX: 0.5,
            anchorY: 0.5,
            x: pos ? pos.x : 0,
            y: pos ? pos.y : 0,
        });
    }
}
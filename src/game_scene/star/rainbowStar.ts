import { Halo } from "../effect/halo";
import { Star } from "./star";

export class RainbowStar extends Star {

    constructor(scene: g.Scene, private halo: Halo, pos?: g.CommonOffset) {
        super(scene, pos, "img_rainbow_star");
    }

    override turnOff(_relightSec: number): void {
        this.hide();
        this.halo.destroy();
    }
}
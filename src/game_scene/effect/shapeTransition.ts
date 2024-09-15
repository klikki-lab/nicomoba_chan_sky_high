import * as tl from "@akashic-extension/akashic-timeline";
import { EasingType } from "@akashic-extension/akashic-timeline/lib/EasingType";

export class ShapeTransition extends g.Sprite {

    private static readonly DEFAULT_DURATION = 200;
    private static readonly MAX_SCALE = 80;

    private timeline: tl.Timeline;

    constructor(scene: g.Scene) {
        super({
            scene: scene,
            parent: scene,
            src: scene.asset.getImageById("img_black_star"),
            anchorX: .5,
            anchorY: .5,
            opacity: 0,
            angle: g.game.random.generate() * 90,
        });
        this.timeline = new tl.Timeline(scene);
    }

    private startAnim = (initialScale: number, callback: () => void, duration: number, easing: EasingType, wait: number): void => {
        const initialOpacity = initialScale === 0 ? .25 : 1;
        this.opacity = initialOpacity;
        this.scale(initialScale);
        this.modified();

        const toScale = initialScale === 0 ? ShapeTransition.MAX_SCALE : 0;
        const toOpacity = initialScale === 0 ? 1 : 0;
        this.timeline.create(this)
            .scaleTo(toScale, toScale, duration, easing)
            .con()
            .by({ opacity: toOpacity }, duration, easing)
            .wait(wait)
            .call(() => {
                this.destroy();
                callback();
            });
    };

    out = (callback: () => void, duration: number = ShapeTransition.DEFAULT_DURATION): void => {
        this.startAnim(0, callback, duration, tl.Easing.easeInCirc, 50);
    };

    in = (callback: () => void, duration: number = ShapeTransition.DEFAULT_DURATION): void => {
        this.startAnim(ShapeTransition.MAX_SCALE, callback, duration, tl.Easing.easeOutCirc, 0);
    };
}
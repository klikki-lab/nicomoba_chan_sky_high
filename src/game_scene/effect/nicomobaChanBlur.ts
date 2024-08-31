import { NicomobaChan } from "../nicomobaChan";

export class NicomobaChanBlur extends g.Sprite {

    constructor(scene: g.Scene, nicomobaChan: NicomobaChan) {
        super({
            scene: scene,
            src: scene.asset.getImageById("nicomoba_chan"),
            anchorX: 0.5,
            anchorY: 0.5,
            x: nicomobaChan.prev.x,
            y: nicomobaChan.prev.y,
            opacity: 0.3,
            scaleX: nicomobaChan.scaleX,
        });

        this.onUpdate.add(() => {
            this.opacity *= 0.5;
            if (this.opacity <= 0.01) {
                this.destroy();
                return true;
            }
        });
    }
}
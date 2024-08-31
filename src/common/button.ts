export class Button extends g.Sprite {

    private _onPressed?: (button: Button) => void;
    private _onClick?: (button: Button) => void;
    private isPressed: boolean = false;

    constructor(scene: g.Scene, assetId: string) {
        const asset = scene.asset.getImageById(assetId);
        super({
            scene: scene,
            src: asset,
            srcWidth: asset.width / 2,
            width: asset.width / 2,
            touchable: true,
        });


        const switchPressedState = (isPressed: boolean) => {
            if (this.isPressed === isPressed) return;

            this.isPressed = isPressed;
            this.srcX = isPressed ? this.width : 0;
            this.invalidate();
        };

        this.onPointDown.add((_ev: g.PointDownEvent) => {
            switchPressedState(true);
            this._onPressed?.(this);
        });

        this.onPointMove.add((ev: g.PointMoveEvent) => {
            if (!this.isPressed) return;

            const ex = ev.point.x + ev.startDelta.x;
            const ey = ev.point.y + ev.startDelta.y;
            if (ex < 0 || ex > this.width || ey < 0 || ey > this.height) {
                switchPressedState(false);
            }
        });

        this.onPointUp.add((_ev: g.PointUpEvent) => {
            if (this.isPressed) {
                switchPressedState(false);
                this._onClick?.(this);
            }
        });
    }

    set onPressed(listener: (button: Button) => void) { this._onPressed = listener; };

    set onClick(listener: (button: Button) => void) { this._onClick = listener; };
}
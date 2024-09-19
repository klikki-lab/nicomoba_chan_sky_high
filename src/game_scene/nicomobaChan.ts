export class NicomobaChan extends g.Sprite {

    private static readonly JUMP_ACCELERATION: number = 24;
    private static readonly ACCELERATION: number = 1;
    private static readonly MAX_VELOCITY_RATE: number = 2;

    private _onJumping?: (nicomobaChan: NicomobaChan) => void;
    private _onFalling?: (nicomobaChan: NicomobaChan) => void;
    private _onGround?: (nicomobaChan: NicomobaChan, normarizeVelocityY: number) => void;
    private velocity: g.CommonOffset = { x: 0, y: 0 };
    private _prev: g.CommonOffset = { x: 0, y: 0 };
    private dest: g.CommonOffset = { x: 0, y: 0 };
    private _groundY: number = 0;
    private _maxSkyHigh: number = 0;
    private canJump: boolean = true;

    constructor(scene: g.Scene) {
        super({
            scene: scene,
            src: scene.asset.getImageById("nicomoba_chan"),
            anchorX: 0.5,
            anchorY: 1,
        });
        this.onUpdate.add(this.updateHandler);
    }

    private updateHandler = (): void | boolean => {
        if (this.scaleY < 1) {
            this.scaleY = Math.min(this.scaleY * 1.1, 1);
            this.modified();
        }
        if (this.scaleX > 1 || this.scaleX < -1) {
            this.scaleX *= 0.9;
            if (this.scaleX > 1) {
                this.scaleX = 1;
            } else if (this.scaleX < -1) {
                this.scaleX = -1;
            }
            this.modified();
        }

        const velocityRate = 1 - this.normarizeVelocityY();
        const animCycle = Math.floor((g.game.fps * .87) * velocityRate) + 1;
        if (g.game.age % animCycle === 0) {
            this.scaleX *= -1;
            this.modified();
        }

        if (this.canJump) {
            return;
        }

        this._prev.x = this.x;
        this._prev.y = this.y - this.height * 0.5;

        const diffX = this.dest.x - this.x;
        if (Math.abs(diffX) > 0.01) {
            const vx = Math.abs(diffX) > 1 ? diffX / (g.game.fps / 5) : diffX;
            const maxVX = this.width * 0.25;
            this.x += vx > maxVX ? maxVX : vx < -maxVX ? -maxVX : vx;
            if (this.x - this.width * 0.5 < 0) {
                this.x = this.width * 0.5;
            } else if (this.x + this.width * 0.5 > g.game.width) {
                this.x = g.game.width - this.width * 0.5;
            }
            this.modified();
        }

        this.y += this.velocity.y;
        this.velocity.y += NicomobaChan.ACCELERATION;
        this.velocity.y = Math.min(this.velocity.y, this.height);

        if (this.velocity.y < 0) {
            this._onJumping?.(this);
        } else {
            this._onFalling?.(this);
        }

        if (this.y >= this._groundY) {
            this.y = this._groundY;

            this.landed();
            this._onGround?.(this, this.normarizeVelocityY());
            this.velocity.y = 0;
            this.canJump = true;
        }

        this._maxSkyHigh = Math.min(this._maxSkyHigh, this.y + this.groundY);
        this.modified();
    };

    private normarizeVelocityY = (): number =>
        Math.min(1, Math.abs(this.velocity.y) / (NicomobaChan.JUMP_ACCELERATION * NicomobaChan.MAX_VELOCITY_RATE));

    private setScele = (scaleX: number, scaleY: number): void => {
        this.scaleX = scaleX;
        this.scaleY = scaleY;
    };

    private landed = (): void => {
        const normarize = this.normarizeVelocityY();
        const rate = 0.25 * normarize + 0.1;
        this.setScele(1 + rate, 1 - rate);
    };

    landedOnStar = (isRainbowStar: boolean = false) => {
        this.canJump = false;

        const acceleration = -NicomobaChan.JUMP_ACCELERATION * (isRainbowStar ? NicomobaChan.MAX_VELOCITY_RATE : 1);
        if (this.velocity.y < 0) {
            if (this.velocity.y > acceleration) {
                this.velocity.y = acceleration;
            }
        } else {
            this.velocity.y = acceleration;
        }
        this.landed();
        this.modified();
    };

    jump = (dest: g.CommonOffset): void => {
        if (!this.canJump) return;

        this.setScele(1.25, 0.75);
        this.modified();
        this.dest = dest;
        this.canJump = false;
        this.velocity.y = -NicomobaChan.JUMP_ACCELERATION;
    };

    move = (x: number): void => { this.dest.x = x; };

    get prev(): g.CommonOffset { return this._prev; }

    get maxSkyHigh(): number { return this._maxSkyHigh; }

    getMaxSkyHighTop = (): number => this._maxSkyHigh - this.height;

    get groundY(): number { return this._groundY; }

    set groundY(groundY: number) { this._groundY = groundY; }

    set onJumping(callback: (nicomobaChan: NicomobaChan) => void) { this._onJumping = callback; };

    set onFalling(callback: (nicomobaChan: NicomobaChan) => void) { this._onFalling = callback; };

    set onGround(callback: (nicomobaChan: NicomobaChan, normarizeVelocityY: number) => void) { this._onGround = callback; };
}
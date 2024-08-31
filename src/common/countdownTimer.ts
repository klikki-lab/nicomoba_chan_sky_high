export class CountdownTimer {

    private _onTick?: (remainingSec: number) => void;
    private _onFinish?: () => void;
    private prevSec: number;
    private isStopped: boolean = false;

    constructor(private _remainingSec: number) {
        this.prevSec = _remainingSec;
    }

    update = (): void => {
        if (this.isStopped) return;

        this._remainingSec -= 1 / g.game.fps;
        const sec = Math.ceil(this._remainingSec);
        if (sec !== this.prevSec) {
            this.prevSec = sec;
            this._onTick?.(sec);
            if (sec <= 0) {
                this.isStopped = true;
                this._onFinish?.();
            }
        }
    };

    /**
     * カウントダウンを停止する。
     * @returns カウントダウン中であれば true、そうでなければ false
     */
    stop = (): boolean => {
        if (!this.isStopped) {
            this.isStopped = true;
            return true;
        }
        return false;
    };

    get remainingSec(): number { return this._remainingSec; }

    set onTick(callback: (remainingSec: number) => void) { this._onTick = callback; };

    set onFinish(callback: () => void) { this._onFinish = callback; };
}
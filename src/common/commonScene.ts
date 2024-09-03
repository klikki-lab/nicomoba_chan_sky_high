export abstract class CommonScene extends g.Scene {

    protected _onFinish?: () => void;

    set onFinish(callback: () => void) { this._onFinish = callback; }
}
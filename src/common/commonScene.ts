export abstract class CommonScene extends g.Scene {

    private _onFinish?: () => void;

    set onFinish(callback: () => void) { this._onFinish = callback; }
}
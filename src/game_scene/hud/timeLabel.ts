export class TimeLabel extends g.Label {

    constructor(scene: g.Scene, font: g.BitmapFont, sec: number) {
        super({
            scene: scene,
            font: font,
            text: `TIME ${(" " + sec).slice(-2)}`,
            opacity: 0.75,
        });
    }

    setTime = (sec: number): void => {
        this.text = `TIME ${(" " + sec).slice(-2)}`;
        this.invalidate();
    };
}
import * as tl from "@akashic-extension/akashic-timeline";

export class ScoreLabel extends g.Label {

    private static readonly COUNTER_STOP = 9999999;
    private static readonly SPACES = "      ";

    constructor(scene: g.Scene, font: g.BitmapFont, initialScore: number = 0) {
        super({
            scene: scene,
            font: font,
            text: `SCORE ${(ScoreLabel.SPACES + initialScore).slice(-(ScoreLabel.SPACES.length + 1))}`,
            opacity: 0.75,
        });
        g.game.vars.gameState.score = initialScore;
    }

    private clamp = (score: number): number => {
        g.game.vars.gameState.score += score;
        return Math.min(g.game.vars.gameState.score, ScoreLabel.COUNTER_STOP);
    };

    private setText = (score: number): void => {
        this.text = `SCORE ${(ScoreLabel.SPACES + score).slice(-(ScoreLabel.SPACES.length + 1))}`;
        this.invalidate();
    };

    addScore = (score: number): void => { this.setText(this.clamp(score)); };

    addScoreAnimation = (score: number, duration: number): void => {
        const clamped = this.clamp(score);
        new tl.Timeline(this.scene)
            .create(this)
            .every((e: number, p: number) => {
                this.setText(clamped - Math.floor(score * (1 - p)));
            }, duration);
    };
}
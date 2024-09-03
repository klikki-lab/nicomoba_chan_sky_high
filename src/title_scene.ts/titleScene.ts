import * as tl from "@akashic-extension/akashic-timeline";
import { Button } from "../common/button";
import { CountdownTimer } from "../common/countdownTimer";
import { NicomobaChan } from "../game_scene/nicomobaChan";
import { NicomobaChanBlur } from "../game_scene/effect/nicomobaChanBlur";
import { Star } from "../game_scene/star/star";
import { Collider } from "../common/collider";
import { SplashFragments } from "../game_scene/effect/splashFragments";
import { Background } from "../game_scene/background";
import { CommonScene } from "../common/commonScene";

export class TitleScene extends CommonScene {

    private countdownTimer: CountdownTimer;
    private nicomobaChan: NicomobaChan;
    private isFinish: boolean = false;

    constructor(private timeLimit: number) {
        super({
            game: g.game,
            assetIds: [
                "nicomoba_chan", "img_title", "img_description",
                "img_how_to_play", "img_to_start", "img_start_button",
                "img_star", "img_landscape", "img_font", "font_glyphs",
            ],
        });
        this.onLoad.add(this.loadHandler);
    }

    private loadHandler = (): void => {
        new g.FilledRect({
            scene: this,
            parent: this,
            width: g.game.width,
            height: g.game.height,
            cssColor: `rgb(0,0,${Background.DEFAULT_SKY_COLOR})`,
        });
        const landscape = new g.Sprite({
            scene: this,
            src: this.asset.getImageById("img_landscape"),
            anchorX: 0.5,
            anchorY: 0.5,
        });
        landscape.moveTo(g.game.width * 0.5, g.game.height - landscape.height * 0.25);
        this.append(landscape);

        const effectLayer = new g.E({ scene: this, parent: this });

        const titleAsset = this.asset.getImageById("img_title");
        const title = new g.Sprite({
            scene: this,
            src: titleAsset,
            anchorX: 0.5,
            anchorY: 0.5,
            x: g.game.width * 0.5,
            y: -titleAsset.height * 0.5,
        });
        this.append(title);

        const layer = new g.E({ scene: this, parent: this, y: -16, opacity: 0 });

        const toStart = new g.Sprite({
            scene: this,
            src: this.asset.getImageById("img_to_start"),
            anchorX: 0.5,
            anchorY: 0.5,
        });
        toStart.moveTo(g.game.width - toStart.width * 1.25, toStart.height);
        layer.append(toStart);

        const bitmapFont = new g.BitmapFont({
            src: this.asset.getImageById("img_font"),
            glyphInfo: this.asset.getJSONContentById("font_glyphs"),
        });
        const timeLabel = new g.Label({
            scene: this,
            font: bitmapFont,
            text: this.timeLimit.toString(),
            anchorX: 0.5,
            anchorY: 0.5,
        });
        timeLabel.x = toStart.x + toStart.width * 0.5 + timeLabel.width;
        timeLabel.y = toStart.y;
        layer.append(timeLabel);

        this.countdownTimer = new CountdownTimer(this.timeLimit);
        this.countdownTimer.onTick = (remainingSec => {
            timeLabel.text = remainingSec.toString();
            timeLabel.invalidate();
        });
        this.countdownTimer.onFinish = (() => this.isFinish = true);

        const description = new g.Sprite({
            scene: this,
            src: this.asset.getImageById("img_description"),
            anchorX: 0.5,
            anchorY: 0.5,
            x: g.game.width * 0.5,
            y: g.game.height * 0.4,
        });
        layer.append(description);

        const howToPlay = new g.Sprite({
            scene: this,
            src: this.asset.getImageById("img_how_to_play"),
            anchorX: 0.5,
            anchorY: 0.5,
        });
        howToPlay.moveTo(howToPlay.width * 0.5 + 16, g.game.height - howToPlay.height * 0.5 - 16);
        layer.append(howToPlay);

        const startButton = new Button(this, "img_start_button");
        startButton.x = g.game.width - startButton.width - startButton.height * 0.5;
        startButton.y = g.game.height - startButton.height * 1.5;
        startButton.onClick = (button => {
            if (this.countdownTimer.stop()) {
                this.isFinish = true;
                button.onPointDown.removeAll();
                button.onPointUp.removeAll();
            }
        });
        layer.append(startButton);

        const star = new Star(this, { x: g.game.width * 0.5, y: g.game.height * 0.435 });
        layer.append(star);

        this.nicomobaChan = this.createNicomobaChan(star, effectLayer);
        layer.append(this.nicomobaChan);

        const timeline = new tl.Timeline(this);
        timeline.create(title)
            .moveY(g.game.height * 0.4, 250, tl.Easing.easeOutCirc)
            .wait(750)
            .moveTo(128, 80, 100, tl.Easing.easeOutCirc)
            .con()
            .scaleBy(0.3, 0.3, 100, tl.Easing.easeOutCirc)
            .con()
            .rotateTo(-30, 100, tl.Easing.easeOutCirc)
            .con()
            .call(() => {
                new tl.Timeline(this).create(layer)
                    .fadeIn(200, tl.Easing.easeOutCirc)
                    .con()
                    .moveY(0, 200, tl.Easing.easeOutCirc)
                    .call(() => {
                        this.onUpdate.add(this.updateHandler);
                        this.onPointDownCapture.add(this.pointDownHandler);
                        this.onPointMoveCapture.add(this.pointMoveHandler);
                        window?.addEventListener('mousemove', this.mouseMove);
                    });
            });
    };

    private pointDownHandler = (ev: g.PointDownEvent): void => {
        if (ev.target instanceof Button) return;
        this.nicomobaChan.jump(ev.point);
    };

    private pointMoveHandler = (ev: g.PointMoveEvent): void => {
        if (ev.target instanceof Button) return;
        this.nicomobaChan.move(ev.point.x + ev.startDelta.x);
    };

    private mouseMove = (ev: MouseEvent) => { this.nicomobaChan.move(ev.clientX); }

    private updateHandler = (): void | boolean => {
        //this.countdownTimer.update();
        if (this.isFinish) {
            this.onPointDownCapture.remove(this.pointDownHandler);
            this.onPointMoveCapture.remove(this.pointMoveHandler);
            window?.removeEventListener('mousemove', this.mouseMove)
            this._onFinish?.();
            return true;
        }
    };

    private createNicomobaChan = (star: Star, effectLayer: g.E): NicomobaChan => {
        const detectCollision = (nicomobaChan: NicomobaChan): void => {
            if (star.visible() && Collider.intersect(nicomobaChan, star)) {
                nicomobaChan.landedOnStar();
                new SplashFragments(this, effectLayer, star);
                star.turnOff(g.game.fps * 5);
            }
        };

        const nicomobaChan = new NicomobaChan(this);
        nicomobaChan.groundY = g.game.height - nicomobaChan.height;
        nicomobaChan.moveTo(g.game.width * 0.5, g.game.height - nicomobaChan.height);
        nicomobaChan.onJumping = ((nicomobaChan: NicomobaChan): void => {
            effectLayer.append(new NicomobaChanBlur(this, nicomobaChan));
            detectCollision(nicomobaChan);
        });
        nicomobaChan.onFalling = ((nicomobaChan: NicomobaChan) => {
            effectLayer.append(new NicomobaChanBlur(this, nicomobaChan));
            detectCollision(nicomobaChan);
        });
        return nicomobaChan;
    }
}
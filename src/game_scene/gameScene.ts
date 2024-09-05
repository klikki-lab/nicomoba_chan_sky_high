import * as tl from "@akashic-extension/akashic-timeline";
import { Collider } from "../common/collider";
import { CountdownTimer } from "../common/countdownTimer";
import { ScoreLabel } from "./hud/scoreLabel";
import { TimeLabel } from "./hud/timeLabel";
import { GameMainParameterObject } from "../parameterObject";
import { Background } from "./background";
import { NicomobaChan } from "./nicomobaChan";
import { NicomobaChanBlur } from "./effect/nicomobaChanBlur";
import { SplashFragments } from "./effect/splashFragments";
import { Star } from "./star/star";
import { Halo } from "./effect/halo";
import { RainbowStar } from "./star/rainbowStar";
import { TvChan } from "./star/tvChan";
import { Collisionable } from "./star/collisionable";
import { PopupScore } from "./effect/popupScore";
import { Button } from "../common/button";
import { TitleScene } from "../title_scene.ts/titleScene";
import { CommonScene } from "../common/commonScene";
import { SceneDuration } from "../common/sceneDuration";
import { Util } from "../common/util";

interface CollectedStars {
    normal: number;
    rainbow: number;
}

export class GameScene extends CommonScene {

    private static readonly COMPLETE_GOAL_BONUS_SCORE = 1000000;
    private static readonly TIME_BONUS_SCORE = 100000;
    private static readonly BONUS_SCORE_ANIM_DURATION = 5000;
    /** 最大の空の高さのさらに上の余白分 */
    private static readonly SKY_HIGH_MARGIN = 2;
    /** 最大の空の高さ */
    private static readonly MAX_SKY_HIGH = 50;//50
    /** デフォルトの星間距離 */
    private static readonly DEFAULT_STAR_DISTANCE = 4;
    /** 登るごとにデフォルトとレンジを合わせた星間距離に近づく（徐々に離れていく） */
    private static readonly STAR_DISTANCE_RANGE = 1.8;
    /** 虹星の出現率の既定値 */
    private static readonly RAINBOW_STAR_OFFSET_RATE = 0.085;
    /** 登るごとにオフセットとレンジを合わせた虹星の出現率に近づく（徐々に上がっていく） */
    private static readonly RAINBOW_STAR_RANGE_RATE = 0.415;

    private camera: g.Camera2D;
    private timeline: tl.Timeline;
    private nicomobaChan: NicomobaChan;
    private backgroundLayer: g.E;
    private starLayer: g.E[] = [];
    private effectLayer: g.E;
    private blurLayer: g.E;
    private hudLayer: g.E;
    private bitmapFont: g.BitmapFont;
    private scoreLabel: ScoreLabel;
    private countdownTimer: CountdownTimer;
    private collectedStars: CollectedStars = { normal: 0, rainbow: 0 };
    private isCompleteGoal: boolean = false;

    constructor(private _param: GameMainParameterObject, private timeLimit: number) {
        super({
            game: g.game,
            assetIds: [
                "nicomoba_chan", "tv_chan", "img_star", "img_rainbow_star", "img_halo", "img_landscape",
                "img_start", "img_finish", "img_congrats", "img_speech_bubble", "img_last_speech",
                "img_font", "font_glyphs", "img_retry_button",
                "nc82082_the_desired_future_edited", "nc82081_beautiful_night", "nc278695_bell",
            ],
        });

        this.camera = new g.Camera2D({});
        this.timeline = new tl.Timeline(this);
        this.onLoad.add(this.loadHandler);
    }

    private loadHandler = (): void => {
        this.backgroundLayer = new g.E({ scene: this, parent: this });
        this.effectLayer = new g.E({ scene: this, parent: this });

        this.createSky();
        this.putStars();

        g.game.focusingCamera = this.camera;
        this.camera.y = -g.game.height;
        g.game.modified();

        this.blurLayer = new g.E({ scene: this, parent: this });
        this.createNicomobaChan();
        this.createHudLayer();

        this.startGame();
    };

    private startGame = (): void => {
        this.asset.getAudioById("nc82082_the_desired_future_edited").play();
        const start = new g.Sprite({
            scene: this,
            src: this.asset.getImageById("img_start"),
            anchorX: 0.5,
            anchorY: 0.5,
            opacity: 0.0,
        });
        start.moveTo(g.game.width * 0.5, this.camera.y + start.height * 2);
        this.append(start);
        this.timeline.create(start)
            .moveY(this.camera.y + g.game.height * 0.5, 250, tl.Easing.easeOutQuint)
            .con()
            .to({ opacity: 0.75 }, 250, tl.Easing.easeOutQuint)
            .wait(800)
            .moveY(this.camera.y + start.height * 2, 250, tl.Easing.easeInQuint)
            .con()
            .to({ opacity: 0.0 }, 250, tl.Easing.easeInQuint)
            .call(() => {
                this.onUpdate.add(this.updateCountdownHandler);
                this.onPointDownCapture.add(this.pointDownHandler);
                this.onPointMoveCapture.add(this.pointMoveHandler);
                this.addMouseMoveListener();
                start.destroy();
            });
    };

    private updateCountdownHandler = (): void | boolean => { this.countdownTimer.update(); };

    private pointDownHandler = (ev: g.PointDownEvent): void => { this.nicomobaChan.jump(ev.point); };

    private pointMoveHandler = (ev: g.PointMoveEvent): void => { this.nicomobaChan.move(ev.point.x + ev.startDelta.x); };

    private addMouseMoveListener = (): void => { window?.addEventListener('mousemove', this.mouseMoveListener); };

    private removeMouseMoveListener = (): void => { window?.addEventListener('mousemove', this.mouseMoveListener); };

    private mouseMoveListener = (ev: MouseEvent): void => { this.nicomobaChan.move(ev.clientX); };

    private createNicomobaChan = (): void => {
        const detectCollision = (nicomobaChan: NicomobaChan): void => {
            const index = Math.abs(Math.floor((nicomobaChan.y - nicomobaChan.height * 0.5) / g.game.height)) - 1;
            if (index >= 0 && this.starLayer.length > index) {
                const collisionables = this.starLayer[index].children;
                if (!collisionables) return;

                for (let i = 0; i < collisionables.length; i++) {
                    const collisionable = collisionables[i];
                    if (!(collisionable instanceof Collisionable)) continue;

                    if (collisionable.visible() && Collider.intersect(nicomobaChan, collisionable)) {
                        if (collisionable instanceof Star) {
                            const isRainbowStar = collisionable instanceof RainbowStar;
                            this.asset.getAudioById("nc278695_bell").play().changeVolume(isRainbowStar ? .75 : .25);
                            const score = (index + 1) * (100 * (isRainbowStar ? 3 : 1));
                            this.scoreLabel.addScore(score);
                            if (isRainbowStar) {
                                this.collectedStars.rainbow++
                            } else {
                                this.collectedStars.normal++;
                            }

                            this.nicomobaChan.landedOnStar(isRainbowStar);
                            new SplashFragments(this, this.effectLayer, collisionable, isRainbowStar);
                            this.effectLayer.append(new PopupScore(this, this.bitmapFont, score, collisionable));
                            collisionable.turnOff(g.game.fps * 5);
                            break;
                        } else if (collisionable instanceof TvChan) {
                            if (!this.countdownTimer.stop()) break;

                            this.isCompleteGoal = true;
                            const remainingSec = Math.ceil(this.countdownTimer.remainingSec);
                            const bosunScore = GameScene.COMPLETE_GOAL_BONUS_SCORE + GameScene.TIME_BONUS_SCORE * remainingSec;
                            this.scoreLabel.addScoreAnimation(bosunScore, GameScene.BONUS_SCORE_ANIM_DURATION);

                            this.removeListener();
                            this.removeUpdateHandler();
                            this.completeGoal(collisionable);
                            break;
                        }
                    }
                }
            }
        };

        const moveCamera = (y: number): void => {
            this.camera.y = y;
            this.camera.modified();
            this.hudLayer.y = y;
            this.hudLayer.modified();
        };

        this.nicomobaChan = new NicomobaChan(this);
        this.nicomobaChan.groundY = -this.nicomobaChan.height
        this.nicomobaChan.moveTo(g.game.width * 0.5, -this.nicomobaChan.height);
        this.nicomobaChan.onJumping = ((nicomobaChan: NicomobaChan): void => {
            if (nicomobaChan.y < -g.game.height * 0.5) {
                moveCamera(nicomobaChan.y - g.game.height * 0.5);
            }
            this.blurLayer.append(new NicomobaChanBlur(this, nicomobaChan));
            detectCollision(nicomobaChan);
        });
        this.nicomobaChan.onFalling = ((nicomobaChan: NicomobaChan): void => {
            if (nicomobaChan.y > this.camera.y + g.game.height * 0.5) {
                moveCamera(Math.min(nicomobaChan.y - g.game.height * 0.5, -g.game.height));
            }
            this.blurLayer.append(new NicomobaChanBlur(this, nicomobaChan));
            detectCollision(nicomobaChan);
        });
        this.nicomobaChan.onGround = ((nicomobaChan: NicomobaChan, normarizeVelocityY): void => {
            moveCamera(-g.game.height);

            const y = nicomobaChan.height * normarizeVelocityY * normarizeVelocityY * normarizeVelocityY;
            const duration1 = 50, duration2 = 100;
            this.timeline.create(this.camera)
                .moveBy(0, y, duration1, tl.Easing.linear)
                .moveBy(0, -y, duration2, tl.Easing.easeOutBounce);
            this.timeline.create(this.hudLayer)
                .moveBy(0, y, duration1, tl.Easing.linear)
                .moveBy(0, -y, duration2, tl.Easing.easeOutBounce);
        });
        this.append(this.nicomobaChan);
    };

    private createSky = (): void => {
        const createDistantStar = (background: Background, index: number): void => {
            for (let i = 0; i < index * 2; i++) {
                const size = g.game.random.generate() * 2 + 1;
                const offsetX = g.game.width * 0.05;
                const offsetY = g.game.height * 0.05;
                const distantStar = new g.FilledRect({
                    scene: this,
                    width: size,
                    height: size,
                    cssColor: "white",
                    anchorX: 0.5,
                    anchorY: 0.5,
                    opacity: 0.75,
                    angle: g.game.random.generate() * 360,
                    x: g.game.random.generate() * (g.game.width * 0.9) + offsetX,
                    y: g.game.random.generate() * (g.game.height * 0.9) + offsetY,
                });
                if (size > 2.8) {
                    const lightSize = g.game.random.generate() * 3 + size * 4
                    for (let j = 0; j < 2; j++) {
                        new g.FilledRect({
                            scene: this,
                            parent: distantStar,
                            width: j * lightSize + size / 2,
                            height: (1 - j) * lightSize + size / 2,
                            cssColor: "white",
                            anchorX: 0.5,
                            anchorY: 0.5,
                            opacity: 0.5,
                            x: distantStar.width / 2,
                            y: distantStar.height / 2,
                        });
                    }
                }
                background.append(distantStar);
            }
        };

        const maxSky = GameScene.MAX_SKY_HIGH + GameScene.SKY_HIGH_MARGIN;
        for (let i = -1; i <= maxSky; i++) {
            const colorRate = 1 - i / maxSky;
            const background = new Background(this, i, colorRate);
            createDistantStar(background, i);
            this.backgroundLayer.append(background);
            if (i < 0 || i > GameScene.MAX_SKY_HIGH) continue;

            if (i === 0) {
                const landscape = new g.Sprite({
                    scene: this,
                    src: this.asset.getImageById("img_landscape"),
                    anchorX: 0.5,
                    anchorY: 0.75,
                    x: background.width / 2,
                    y: background.height,
                });
                background.append(landscape);
            }
            this.starLayer.push(new g.E({ scene: this, parent: this }));
        }
    };

    private putStars = (): void => {
        const generatePos = (index: number, width: number, height: number, offsetX: number, offsetY: number): g.CommonOffset => {
            return {
                x: g.game.random.generate() * width + offsetX,
                y: g.game.random.generate() * height + offsetY - g.game.height * (index + 1)
            }
        };
        const isCloseDistance = (s: number, pos: g.CommonOffset, distance: number) => {
            const stars = this.starLayer[s].children;
            if (!stars || stars.length < 1) return false;

            for (let i = 0; i < stars.length; i++) {
                if (g.Util.distanceBetweenOffsets(pos, stars[i]) < distance) return true;
            }
            return false;
        };
        const appendStar = (index: number, pos: g.CommonOffset, rainbowStarRate: number): void => {
            const isRainbowStar = g.game.random.generate() < rainbowStarRate;
            const star = isRainbowStar ?
                new RainbowStar(this, new Halo(this, this.effectLayer, pos), pos) : new Star(this, pos);
            this.starLayer[index].append(star);
        };

        const maxStarNum = 18;
        const maxTryTimes = 3;
        const offsetX = Star.SIZE * 4;
        const offsetY = Star.SIZE * 4;
        const w = g.game.width - offsetX;
        for (let i = 0; i <= GameScene.MAX_SKY_HIGH; i++) {
            if (i === GameScene.MAX_SKY_HIGH) {
                const x = g.game.width * 0.5;
                const y = -g.game.height * i - g.game.height * 0.5;
                const halo = new Halo(this, this.effectLayer, { x: x, y: y });
                halo.scale(6);
                const tvChan = new TvChan(this, halo, { x: x, y: y });
                this.starLayer[i].append(tvChan);
                continue;
            }

            const skyHighRate = i / GameScene.MAX_SKY_HIGH;
            const distance = (GameScene.DEFAULT_STAR_DISTANCE + skyHighRate * GameScene.STAR_DISTANCE_RANGE) * Star.SIZE;
            const h = g.game.height * (i === 0 ? 0.7 : 1) - offsetY;
            for (let j = 0; j < maxStarNum; j++) {
                if (i === GameScene.MAX_SKY_HIGH - 1 && j === 0) {
                    const pos = {
                        x: g.game.width * .5 + (g.game.random.generate() * 2 - 1) * Star.SIZE,
                        y: g.game.height * .5 - g.game.height * (i + 1)
                    }
                    appendStar(i, pos, 1);
                    continue;
                }
                let tryTimes = 0;
                let pos = generatePos(i, w, h, offsetX / 2, offsetY / 2);
                while (isCloseDistance(i, pos, distance) && tryTimes++ < maxTryTimes) {
                    pos = generatePos(i, w, h, offsetX / 2, offsetY / 2);
                }
                if (tryTimes >= maxTryTimes) continue;

                const rate = GameScene.RAINBOW_STAR_OFFSET_RATE + skyHighRate * GameScene.RAINBOW_STAR_RANGE_RATE;
                appendStar(i, pos, rate);
            }
        }
    };

    private createHudLayer = (): void => {
        this.bitmapFont = new g.BitmapFont({
            src: this.asset.getImageById("img_font"),
            glyphInfo: this.asset.getJSONContentById("font_glyphs"),
        });

        this.scoreLabel = new ScoreLabel(this, this.bitmapFont);
        this.scoreLabel.x = g.game.width - this.scoreLabel.width - this.scoreLabel.height * 0.1;
        this.scoreLabel.y = g.game.height - this.scoreLabel.height * 1.1;

        const timeLabel = new TimeLabel(this, this.bitmapFont, this.timeLimit);
        timeLabel.x = timeLabel.height * 0.1;
        timeLabel.y = g.game.height - timeLabel.height * 1.1;
        this.hudLayer = new g.E({ scene: this, parent: this, y: this.camera.y });
        this.hudLayer.append(timeLabel);
        this.hudLayer.append(this.scoreLabel);

        this.countdownTimer = new CountdownTimer(this.timeLimit);
        this.countdownTimer.onTick = (remainingSec => timeLabel.setTime(remainingSec));
        this.countdownTimer.onFinish = (() => {
            if (this.isCompleteGoal) return;

            this.removeListener();
            this.removeUpdateHandler();
            this.effectLayer.children?.forEach(e => e?.onUpdate.removeAll());
            this.blurLayer.children?.forEach(e => e?.onUpdate.removeAll());
            this.showFinishGame();
            this.showSkyHighResult(0, 7);
            this.showResultCollectedStars(1, 7 - 1.5);

            if (!Util.isNicoNicoDomain()) {
                this.showRetryButton(2000);
            }
        });
    };

    private removeListener = (): void => {
        this.onPointDownCapture.remove(this.pointDownHandler);
        this.onPointMoveCapture.remove(this.pointMoveHandler);
        this.removeMouseMoveListener();
    };

    private removeUpdateHandler = (): void => {
        this.onUpdate.remove(this.updateCountdownHandler);
        this.nicomobaChan.onUpdate.removeAll();
        this.starLayer.forEach(e => {
            e?.children?.forEach(e => {
                e?.onUpdate.removeAll();
            })
        });
    };

    private completeGoal = (tvChan: TvChan): void => {
        let next: number = 5;
        const updateBlessingHandler = (): void => {
            if (g.game.age % next === 0) {
                const pos = {
                    x: g.game.width * .5 + (g.game.random.generate() * 2 - 1) * g.game.width * .3,
                    y: g.game.height * .5 + this.camera.y + (g.game.random.generate() * 2 - 1) * g.game.height * .3
                };
                const isRainbowStar = g.game.random.generate() < 0.25;
                new SplashFragments(this, this.effectLayer, pos, isRainbowStar);
                next = Math.floor(g.game.random.generate() * 10) + 1;
            }
        };

        const showMessage = (): void => {
            const pos = this.nicomobaChan.x < g.game.width * .5 ? -1 : 1;
            const bubble = new g.Sprite({
                scene: this,
                parent: this,
                src: this.asset.getImageById("img_speech_bubble"),
                anchorX: 0.5,
                anchorY: 0.5,
                opacity: 0,
                scaleX: -pos,
            });
            bubble.moveTo(tvChan.x - bubble.width * pos * 1.25, tvChan.y - 64);

            const speech = new g.Sprite({
                scene: this,
                src: this.asset.getImageById("img_last_speech"),
                parent: this,
                anchorX: 0.5,
                anchorY: 0.5,
                opacity: 0,
                x: bubble.x,
                y: bubble.y,
            });

            new tl.Timeline(this).create(bubble).to({ opacity: 0.5 }, 500, tl.Easing.easeOutQuint);
            new tl.Timeline(this).create(speech).to({ opacity: 0.75 }, 500, tl.Easing.easeOutQuint);
        };

        const moveY = tvChan.y - g.game.height * 0.5;
        this.timeline.create(this.camera)
            .moveTo(0, moveY, 1000, tl.Easing.easeOutQuint)
            .call(() => {
                this.asset.getAudioById("nc82082_the_desired_future_edited").stop();
                this.asset.getAudioById("nc82081_beautiful_night").play();

                const congrats = new g.Sprite({
                    scene: this,
                    src: this.asset.getImageById("img_congrats"),
                    anchorX: 0.5,
                    anchorY: 0.5,
                    opacity: 0,
                });
                congrats.moveTo(g.game.width * 0.5, this.camera.y - congrats.height * .5);
                this.append(congrats);
                new tl.Timeline(this).create(congrats)
                    .moveY(this.camera.y + congrats.height, 1000, tl.Easing.easeOutQuint)
                    .con()
                    .to({ opacity: .8 }, 1000, tl.Easing.easeOutQuint)
                    .call(() => {
                        showMessage();

                        const pos = { x: this.nicomobaChan.x, y: this.nicomobaChan.y - this.nicomobaChan.height * .5 };
                        new Halo(this, this.effectLayer, pos).scale(2);
                    });

                this.showSkyHighResult(0, 10);
                this.showResultCollectedStars(1, 10 - 1.5);
                this.showResultLabel(`GOAL BONUS    ${GameScene.COMPLETE_GOAL_BONUS_SCORE}`, 3, 5.5);
                const remainingSec = (" " + Math.ceil(this.countdownTimer.remainingSec)).slice(-2);
                this.showResultLabel(`TIME BONUS  ${remainingSec}*${GameScene.TIME_BONUS_SCORE}`, 4, 4);
                this.onUpdate.add(updateBlessingHandler);

                if (!Util.isNicoNicoDomain()) {
                    this.showRetryButton(2000);
                }
            });
        this.timeline.create(this.hudLayer)
            .moveTo(0, moveY, 1000, tl.Easing.easeOutQuint);
    };

    private showFinishGame = (): void => {
        const finish = new g.Sprite({
            scene: this,
            parent: this,
            src: this.asset.getImageById("img_finish"),
            anchorX: 0.5,
            anchorY: 0.5,
            opacity: 0,
        });
        finish.moveTo(g.game.width * 0.5, this.camera.y - finish.height * 0.5);
        new tl.Timeline(this).create(finish)
            .moveY(this.camera.y + g.game.height * 0.5, 1000, tl.Easing.easeOutQuint)
            .con()
            .to({ opacity: 0.75 }, 1000);
    };

    private showSkyHighResult = (order: number, y: number): void => {
        const maxSkyHigh = g.game.height * GameScene.MAX_SKY_HIGH;
        const normalized = Math.min(1, this.nicomobaChan.maxSkyHigh / maxSkyHigh);
        const sinScaleValue = Math.sin(normalized * Math.PI / 2);
        const max2525Height = 25252.5;
        const result = sinScaleValue * sinScaleValue * max2525Height;
        const fixed = ("      " + result.toFixed(1)).slice(-7);
        this.showResultLabel(`MAX SKY HIGH ${fixed}m`, order, y);
    };

    private showResultCollectedStars = (order: number, y: number): void => {
        const normalStars = ("      " + Math.ceil(this.collectedStars.normal)).slice(-7);
        this.showResultLabel(`NORMAL STARS  ${normalStars}`, order, y);
        const rainbowStars = ("      " + Math.ceil(this.collectedStars.rainbow)).slice(-7);
        this.showResultLabel(`RAINBOW STARS ${rainbowStars}`, order + 1, y - 1.5);
    };

    private showRetryButton = (duration: number): void => {
        const retryButton = new Button(this, "img_retry_button");
        retryButton.moveTo(32, this.camera.y + g.game.height - retryButton.height * 2);
        retryButton.opacity = 0;
        retryButton.hide();
        retryButton.onClick = (button => {
            this.asset.getAudioById("nc82082_the_desired_future_edited").stop();
            this.asset.getAudioById("nc82081_beautiful_night").stop();
            button.onPointDown.removeAll();
            button.onPointUp.removeAll();

            this.camera.y = 0;
            this.camera.modified();

            const titleScene = new TitleScene(SceneDuration.TITLE);
            titleScene.onFinish = (): void => g.game.replaceScene(new GameScene(this._param, SceneDuration.GAME));
            g.game.replaceScene(titleScene);
        });
        this.append(retryButton);

        new tl.Timeline(this).create(retryButton)
            .wait(duration)
            .call(() => retryButton.show())
            .fadeIn(1000, tl.Easing.easeOutQuint);
    };

    private showResultLabel = (text: string, order: number, y: number): void => {
        const label = new g.Label({
            scene: this,
            font: this.bitmapFont,
            fontSize: this.bitmapFont.size * 0.5,
            text: text,
            opacity: 0,
        });
        label.x = g.game.width - label.width - label.fontSize;
        label.y = this.camera.y + g.game.height - label.fontSize * (y - 1);
        this.append(label);
        new tl.Timeline(this).create(label)
            .wait(1000 + order * 250)
            .moveY(this.camera.y + g.game.height - label.fontSize * y, 1000, tl.Easing.easeOutQuint)
            .con()
            .to({ opacity: .75 }, 1000, tl.Easing.easeOutQuint);
    };
}

import { StarFragment } from "./starFragment";

export class SplashFragments {

    private static readonly MAX_NUM = 8;

    private starts: StarFragment[] = [];

    constructor(scene: g.Scene, parent: g.Scene | g.E, pos: g.CommonOffset, isRainbowStar: boolean = false) {
        const offsetAngle = Math.PI / (g.game.random.generate() * SplashFragments.MAX_NUM);
        for (let i = 0; i < SplashFragments.MAX_NUM; i++) {
            const rad = 2 * Math.PI * (i / SplashFragments.MAX_NUM) - offsetAngle;
            const pow = isRainbowStar ? 0.5 : 0.35;

            const star = new StarFragment(scene, pos, isRainbowStar);
            const radius = star.width * pow;
            star.velocity.x = Math.cos(rad) * radius;
            star.velocity.y = Math.sin(rad) * radius;
            star.scale(pow);

            this.starts.push(star);
            parent.append(star);
        }
    }
}
import { NicomobaChan } from "../game_scene/nicomobaChan";

export module Collider {

    export function intersect(e1: NicomobaChan, e2: g.E): boolean {
        return e1.x - e1.width / 2 <= e2.x + e2.width / 2 && e2.x - e2.width / 2 <= e1.x + e1.width / 2 &&
            e1.y - e1.height <= e2.y + e2.height / 2 && e2.y - e2.height / 2 <= e1.y;
    }
}
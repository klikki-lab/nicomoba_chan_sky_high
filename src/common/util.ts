export module Util {

    export function isNicoNicoDomain(): boolean {
        try {
            const domain = window?.location?.hostname;
            return domain && domain.indexOf("nicovideo.jp") !== -1;
        } catch (e: unknown) {
            return false;
        }
    }
}
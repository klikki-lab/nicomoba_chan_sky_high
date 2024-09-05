export module WindowUtil {

    export function isNicoNicoDomain(): boolean {
        try {
            const domain = window?.location?.hostname;
            return domain && domain.indexOf("nicovideo.jp") !== -1;
        } catch (e: unknown) {
            return false;
        }
    }

    export function removeMouseMoveEventListener(listener: (ev: MouseEvent) => void): void {
        window?.removeEventListener('mousemove', listener);
    }

    export function addMouseMoveEventListener(listener: (ev: MouseEvent) => void): void {
        window?.addEventListener('mousemove', listener);
    }
}
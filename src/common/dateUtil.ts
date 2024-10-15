export namespace DateUtil {

    export function isHalloween(): boolean {
        const today = new Date();
        return today.getMonth() === 9 && today.getDate() === 31;
    }

    export function isChristmasDays(): boolean {
        const today = new Date();
        return today.getMonth() === 11 && (today.getDate() === 24 || today.getDate() === 25);
    }

    export function isNewYearsDay(): boolean {
        const today = new Date();
        return today.getMonth() === 0 && today.getDate() === 1;
    }
}
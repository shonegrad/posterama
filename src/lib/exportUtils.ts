/**
 * Helpers shared by the export dialog and download logic.
 */

/** Removes a trailing file extension (".png" etc.) from a filename base. */
export function stripExtension(filename: string): string {
    if (!filename) return '';
    const lastDot = filename.lastIndexOf('.');
    return lastDot > 0 ? filename.substring(0, lastDot) : filename;
}

/**
 * Resolves the effective export scale: the "custom" option uses the typed-in
 * value; missing/invalid scale values fall back to 1 (original size).
 */
export function resolveExportScale(scale: string, customScale: number): number {
    const parsed = scale === 'custom' ? customScale : parseFloat(scale);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

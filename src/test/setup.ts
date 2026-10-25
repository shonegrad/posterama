import '@testing-library/jest-dom';

// jsdom does not implement `ImageData`, which the dithering functions rely
// on (segmentation algorithms construct new ImageData objects). Provide a
// minimal spec-compatible shim when it is missing.
if (typeof globalThis.ImageData === 'undefined') {
    class ImageDataShim {
        data: Uint8ClampedArray;
        width: number;
        height: number;

        constructor(
            widthOrData: number | Uint8ClampedArray,
            heightOrWidth?: number,
            maybeHeight?: number
        ) {
            if (typeof widthOrData === 'number') {
                // new ImageData(width, height)
                this.width = widthOrData;
                this.height = heightOrWidth ?? 0;
                this.data = new Uint8ClampedArray(this.width * this.height * 4);
            } else {
                // new ImageData(data, width, height)
                this.data = widthOrData;
                this.width = heightOrWidth ?? 0;
                this.height = maybeHeight ?? 0;
            }
        }
    }
    Object.defineProperty(globalThis, 'ImageData', { value: ImageDataShim });
}

// jsdom lacks `crypto.randomUUID`; polyfill it on the existing crypto object.
const cryptoObj = globalThis.crypto as unknown as {
    randomUUID?: () => string;
    getRandomValues?: (array: Uint8Array) => Uint8Array;
};
if (
    cryptoObj &&
    typeof cryptoObj.randomUUID !== 'function' &&
    typeof cryptoObj.getRandomValues === 'function'
) {
    cryptoObj.randomUUID = () => {
        const bytes = new Uint8Array(16);
        cryptoObj.getRandomValues?.(bytes);
        bytes[6] = (bytes[6] & 0x0f) | 0x40;
        bytes[8] = (bytes[8] & 0x3f) | 0x80;
        const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
        return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    };
}

declare module 'dom-to-image-more' {
    export interface Options {
        bgcolor?: string;
        quality?: number;
        width?: number;
        height?: number;
        style?: Record<string, string>;
        filter?: (node: Node) => boolean;
        imagePlaceholder?: string;
    }

    export function toBlob(node: Node, options?: Options): Promise<Blob>;
    export function toPng(node: Node, options?: Options): Promise<string>;
    export function toJpeg(node: Node, options?: Options): Promise<string>;
    export function toSvg(node: Node, options?: Options): Promise<string>;
    export function toPixelData(node: Node, options?: Options): Promise<Uint8ClampedArray>;
}

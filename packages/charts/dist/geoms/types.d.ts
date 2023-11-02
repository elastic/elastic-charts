import { RgbaTuple } from '../common/color_library_wrappers';
import { TexturedStyles } from '../utils/themes/theme';
/**
 * render options for texture
 * @public
 */
export interface Texture extends Pick<TexturedStyles, 'rotation' | 'offset'> {
    /**
     * pattern to apply to canvas fill
     */
    pattern: CanvasPattern;
}
/**
 * Fill style for every geometry
 * @public
 */
export interface Fill {
    /**
     * fill color in rgba
     */
    color: RgbaTuple;
    texture?: Texture;
}
/**
 * Stroke style for every geometry
 * @public
 */
export interface Stroke {
    /**
     * stroke rgba
     */
    color: RgbaTuple;
    /**
     * stroke width
     */
    width: number;
    /**
     * stroke dash array
     */
    dash?: number[];
}
//# sourceMappingURL=types.d.ts.map
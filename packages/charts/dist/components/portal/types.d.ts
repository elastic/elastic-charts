import { $Values } from 'utility-types';
import { Padding } from '../../utils/dimensions';
/**
 * Placement used in positioning tooltip
 * @public
 */
export declare const Placement: Readonly<{
    Top: "top";
    Bottom: "bottom";
    Left: "left";
    Right: "right";
    TopStart: "top-start";
    TopEnd: "top-end";
    BottomStart: "bottom-start";
    BottomEnd: "bottom-end";
    RightStart: "right-start";
    RightEnd: "right-end";
    LeftStart: "left-start";
    LeftEnd: "left-end";
    Auto: "auto";
    AutoStart: "auto-start";
    AutoEnd: "auto-end";
}>;
/**
 * {@inheritDoc (Placement:variable)}
 * @public
 */
export type Placement = $Values<typeof Placement>;
/**
 * Tooltip portal settings
 *
 * @public
 */
export interface TooltipPortalSettings<B = never> {
    /**
     * Preferred placement of tooltip relative to anchor.
     *
     * This may not be the final placement given the positioning fallbacks.
     *
     * @defaultValue `right` {@link (Placement:type) | Placement.Right}
     */
    placement?: Placement;
    /**
     * If given tooltip placement is not suitable, these `Placement`s will
     * be used as fallback placements.
     */
    fallbackPlacements?: Placement[];
    /**
     * Boundary element to contain tooltip within
     *
     * `'chart'` will use the chart container as the boundary
     *
     * @defaultValue parent scroll container
     */
    boundary?: HTMLElement | B;
    /**
     * Boundary element padding.
     * Used to reduce extents of boundary placement when margins or paddings are used on boundary
     *
     * @defaultValue 0
     */
    boundaryPadding?: Partial<Padding> | number;
    /**
     * Custom tooltip offset
     * @defaultValue 10
     */
    offset?: number;
}
//# sourceMappingURL=types.d.ts.map
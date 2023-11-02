import { ComponentProps } from 'react';
import { Spec } from '.';
import { Ratio } from '../common/geometry';
/**
 * Can be used for margin or padding start/end (eg. left/right or top/bottom)
 * Todo: this will soon change to `{outer, inner}` for explicit specification
 * @alpha
 */
export type RelativeBandsPadding = {
    /**
     * Outer padding specifies the padding size *next to* a small multiples panel that's on the edge of the small
     * multiples grid, expressed as a proportion (ratio) of the panel size
     */
    outer: Ratio;
    /**
     * Inner padding specifies the padding size *between* small multiples panels in the small multiples grid,
     * expressed as a proportion (ratio) of the panel size
     */
    inner: Ratio;
};
/**
 * Specifies styling and stylistic layout attributes relating to small multiples
 * @alpha
 */
export interface SmallMultiplesStyle {
    /**
     * Horizontal padding for each panel, expressed as [leftMarginRatio, rightMarginRatio], relative to the gross panel width
     */
    horizontalPanelPadding: RelativeBandsPadding;
    /**
     * Vertical padding for each panel, expressed as [topMarginRatio, bottomMarginRatio], relative to the gross panel height
     */
    verticalPanelPadding: RelativeBandsPadding;
}
/** @alpha */
export interface SmallMultiplesSpec extends Spec {
    /**
     * Identifies the `<GroupBy id="foo">` referenced by `splitHorizontally="foo"`, specifying horizontal tiling
     */
    splitHorizontally?: string;
    /**
     * Identifies the `<GroupBy id="bar">` referenced by `splitVertically="bar"`, specifying vertical tiling
     */
    splitVertically?: string;
    /**
     * Identifies the `<GroupBy id="baz">` referenced by `splitVertically="baz"`, specifying space-filling tiling in a Z pattern
     */
    splitZigzag?: string;
    /**
     * Specifies styling and layout properties of the tiling, such as paddings between and outside panels
     */
    style?: Partial<SmallMultiplesStyle>;
}
/**
 * Add small multiples spec to chart
 * @alpha
 */
export declare const SmallMultiples: import("react").FC<import("../state/spec_factory").SFProps<SmallMultiplesSpec, "chartType" | "specType", "id", "style" | "splitHorizontally" | "splitVertically" | "splitZigzag", never>>;
/** @public */
export type SmallMultiplesProps = ComponentProps<typeof SmallMultiples>;
//# sourceMappingURL=small_multiples.d.ts.map
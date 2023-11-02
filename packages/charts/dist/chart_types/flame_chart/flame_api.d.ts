import { ChartType } from '..';
import { LegacyAnimationConfig } from '../../common/animation';
import { BaseDatum, Spec } from '../../specs';
import { SpecType } from '../../specs/constants';
import { SFProps } from '../../state/spec_factory';
import { Datum, ValueAccessor, ValueFormatter } from '../../utils/common';
/**
 * Control function for resetting chart focus
 * @public
 */
export type FlameGlobalControl = () => void;
/**
 * Control function for setting chart focus on a specific node
 * @public
 */
export type FlameNodeControl = (nodeIndex: number) => void;
/**
 * Control function for setting chart focus on a specific node
 * @public
 */
export type FlameSearchControl = (text: string) => void;
/**
 * Provides direct controls for the Flame component user.
 * The call site supplied callback function is invoked on the chart component initialization as well as on component update,
 * so the callback must be idempotent.
 * @public
 */
export interface ControlReceiverCallbacks {
    resetFocus: (control: FlameGlobalControl) => void;
    focusOnNode: (control: FlameNodeControl) => void;
    search: (control: FlameSearchControl) => void;
}
/**
 * Column oriented data input for N data points:
 *   - label: array of N strings
 *   - value: Float64Array of N numbers, for tooltip value display
 *   - color: Float32Array of 4 * N numbers, eg. green[i] = color[4 * i + 1]
 *   - position0: Tween from: Float32Array of 2 * N numbers with unit coordinates [x0, y0, x1, y1, ..., xN-1, yN-1]
 *   - position1: Tween to: Float32Array of 2 * N numbers with unit coordinates [x0, y0, x1, y1, ..., xN-1, yN-1]
 *   - size0: Tween from: Float32Array of N numbers with unit widths [width0, width1, ... , widthN-1]
 *   - size1: Tween to: Float32Array of N numbers with unit widths [width0, width1, ... , widthN-1]
 * If position0 === position1 and size0 === size1, then the nodes are not animated
 * @public
 */
export interface ColumnarViewModel {
    label: string[];
    value: Float64Array;
    color: Float32Array;
    position0: Float32Array;
    position1: Float32Array;
    size0: Float32Array;
    size1: Float32Array;
}
/**
 * Specifies the flame chart
 * @public
 */
export interface FlameSpec<D extends BaseDatum = Datum> extends Spec, LegacyAnimationConfig {
    specType: typeof SpecType.Series;
    chartType: typeof ChartType.Flame;
    columnarData: ColumnarViewModel;
    controlProviderCallback: Partial<ControlReceiverCallbacks>;
    valueAccessor: ValueAccessor<D>;
    valueFormatter: ValueFormatter;
    valueGetter: (datumIndex: number) => number;
    search?: {
        text: string;
    };
    onSearchTextChange?: (text: string) => void;
}
declare const buildProps: import("../../state/spec_factory").BuildProps<FlameSpec<any>, "chartType" | "specType", "animation" | "valueFormatter" | "valueGetter" | "valueAccessor", "search" | "onSearchTextChange", "id" | "columnarData" | "controlProviderCallback">;
/**
 * Adds flame spec to chart specs
 * @public
 */
export declare const Flame: <D extends BaseDatum = any>(props: SFProps<FlameSpec<D>, "chartType" | "specType", "animation" | "valueFormatter" | "valueGetter" | "valueAccessor", "search" | "onSearchTextChange", "id" | "columnarData" | "controlProviderCallback">) => null;
export {};
//# sourceMappingURL=flame_api.d.ts.map
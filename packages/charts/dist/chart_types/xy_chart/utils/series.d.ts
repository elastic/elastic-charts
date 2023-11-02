import { BaseDatum } from './specs';
import { SmallMultiplesDatum } from '../../../common/panel_utils';
import { SeriesIdentifier } from '../../../common/series_id';
import { Accessor } from '../../../utils/accessor';
import { Datum } from '../../../utils/common';
/** @public */
export interface FilledValues {
    /** the x value */
    x?: number | string;
    /** the max y value */
    y1?: number;
    /** the minimum y value */
    y0?: number;
}
/** @public */
export interface DataSeriesDatum<T = any> {
    /** the x value */
    x: number | string;
    /** the max y value */
    y1: number | null;
    /** the minimum y value */
    y0: number | null;
    /** initial y1 value, non stacked */
    initialY1: number | null;
    /** initial y0 value, non stacked */
    initialY0: number | null;
    /** the optional mark metric, used for lines and area series */
    mark: number | null;
    /** initial datum */
    datum: T;
    /** the list of filled values because missing or nulls */
    filled?: FilledValues;
}
/** @public */
export interface XYChartSeriesIdentifier<D extends BaseDatum = Datum> extends SeriesIdentifier, SmallMultiplesDatum {
    xAccessor: Accessor<D>;
    yAccessor: Accessor<D>;
    splitAccessors: Map<string | number, string | number>;
    seriesKeys: (string | number)[];
}
//# sourceMappingURL=series.d.ts.map
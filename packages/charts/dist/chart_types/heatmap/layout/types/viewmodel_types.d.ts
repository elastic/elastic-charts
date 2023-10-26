import { Color } from '../../../../common/colors';
import { Pixels } from '../../../../common/geometry';
import { Fill, Stroke } from '../../../../geoms/types';
import { HeatmapCellDatum } from '../viewmodel/viewmodel';
/** @public */
export interface Cell {
    x: number;
    y: number;
    width: number;
    height: number;
    yIndex: number;
    fill: Fill;
    stroke: Stroke;
    value: number;
    formatted: string;
    visible: boolean;
    datum: HeatmapCellDatum;
    textColor: Color;
    fontSize: Pixels;
}
//# sourceMappingURL=viewmodel_types.d.ts.map
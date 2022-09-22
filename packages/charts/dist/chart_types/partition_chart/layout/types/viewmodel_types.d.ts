import { CategoryKey } from '../../../../common/category';
import { Color } from '../../../../common/colors';
import { Distance, Radian } from '../../../../common/geometry';
import { LegendPath } from '../../../../state/actions/legend';
import { MODEL_KEY, ValueGetterName } from '../config';
import { ArrayNode, HierarchyOfArrays } from '../utils/group_by_rollup';
/** @public */
export declare type TreeLevel = number;
/** @public */
export interface AngleFromTo {
    x0: Radian;
    x1: Radian;
}
/**
 * @public
 */
export interface TreeNode extends AngleFromTo {
    x0: Radian;
    x1: Radian;
    y0: TreeLevel;
    y1: TreeLevel;
    fill?: Color;
}
/**
 * @public
 */
export interface SectorGeomSpecY {
    y0px: Distance;
    y1px: Distance;
}
/** @public */
export declare type DataName = CategoryKey;
/** @public */
export interface ShapeTreeNode extends TreeNode, SectorGeomSpecY {
    yMidPx: Distance;
    depth: number;
    sortIndex: number;
    path: LegendPath;
    dataName: DataName;
    value: number;
    [MODEL_KEY]: ArrayNode;
}
/** @public */
export declare type RawTextGetter = (node: ShapeTreeNode) => string;
/** @public */
export declare type ValueGetterFunction = (node: ShapeTreeNode) => number;
/** @public */
export declare type ValueGetter = ValueGetterFunction | ValueGetterName;
/** @public */
export declare type NodeColorAccessor = (d: ShapeTreeNode, index: number, array: HierarchyOfArrays) => string;
//# sourceMappingURL=viewmodel_types.d.ts.map
import { $Values } from 'utility-types';
/**
 * The accessor type
 * @public
 */
export declare const BandedAccessorType: Readonly<{
    Y0: "y0";
    Y1: "y1";
}>;
/** @public */
export type BandedAccessorType = $Values<typeof BandedAccessorType>;
/** @public */
export interface GeometryValue {
    y: any;
    x: any;
    mark: number | null;
    accessor: BandedAccessorType;
    /**
     * The original datum used for this geometry
     */
    datum: any;
}
//# sourceMappingURL=geometry.d.ts.map
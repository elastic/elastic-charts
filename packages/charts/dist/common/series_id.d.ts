import { SpecId } from '../utils/ids';
import { CategoryKey } from './category';
/**
 * A string key used to uniquely identify a series
 * @public
 */
export declare type SeriesKey = CategoryKey;
/**
 * A series identifier
 * @public
 */
export declare type SeriesIdentifier = {
    /**
     * The SpecId, used to identify the spec
     */
    specId: SpecId;
    /**
     * A string key used to uniquely identify a series
     */
    key: SeriesKey;
};
//# sourceMappingURL=series_id.d.ts.map
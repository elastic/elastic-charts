import { CategoryKey } from './category';
import { SpecId } from '../utils/ids';
/**
 * A string key used to uniquely identify a series
 * @public
 */
export type SeriesKey = CategoryKey;
/**
 * A series identifier
 * @public
 */
export type SeriesIdentifier = {
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
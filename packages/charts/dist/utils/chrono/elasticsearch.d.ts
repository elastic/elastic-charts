import { UnixTimestamp } from './types';
/**
 * An [Elasticsearch Calendar interval unit](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-datehistogram-aggregation.html#calendar_intervals)
 * @public
 */
export type ESCalendarIntervalUnit = 'minute' | 'm' | 'hour' | 'h' | 'day' | 'd' | 'week' | 'w' | 'month' | 'M' | 'quarter' | 'q' | 'year' | 'y';
/**
 * An [Elasticsearch fixed interval unit](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-datehistogram-aggregation.html#fixed_intervals)
 * @public
 */
export type ESFixedIntervalUnit = 'ms' | 's' | 'm' | 'h' | 'd';
/**
 * The definition of an [Elasticsearch Calendar interval](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-datehistogram-aggregation.html#calendar_intervals)
 * @public
 */
export interface ESCalendarInterval {
    type: 'calendar';
    unit: ESCalendarIntervalUnit;
    value: number;
}
/**
 * The definition of an [Elasticsearch fixed interval](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-datehistogram-aggregation.html#fixed_intervals)
 * @public
 */
export interface ESFixedInterval {
    type: 'fixed';
    unit: ESFixedIntervalUnit;
    value: number;
}
/**
 * Round a Date or unix timestamp to the beginning or end of the corresponding Elasticsearch date histogram bucket.
 * It uses the [date histogram aggregation Elasticsearch formula](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-datehistogram-aggregation.html#datehistogram-aggregation-time-zone)
 * to compute the fixed interval bucket, and it uses an internal selected date/time library to compute the calendar one.
 *
 * @param date - a unix timestamp or a Date object
 * @param interval - the description of the Elasticsearch interval you want to round to
 * @param snapTo - if you want to snap the date at the `start` or at the `end` of the interval
 * @param timeZone - a IANA timezone
 * @public
 */
export declare function roundDateToESInterval(date: UnixTimestamp | Date, interval: ESCalendarInterval | ESFixedInterval, snapTo: 'start' | 'end', timeZone: string): UnixTimestamp;
//# sourceMappingURL=elasticsearch.d.ts.map
import { DateTime, Interval } from 'luxon';
import { computeMinTimeInterval } from './time_scale_utils';

describe.skip('time scale', () => {
  test('check durations', () => {
    const year2015 = DateTime.fromISO('2015-01-01T00:00:00.000Z');
    const year2016 = DateTime.fromISO('2016-01-01T00:00:00.000Z');
    const year2017 = DateTime.fromISO('2017-01-01T00:00:00.000Z');
    const year2018 = DateTime.fromISO('2018-01-01T00:00:00.000Z');
    // expect(year2015.toISO()).toBe('');
    const interval1516 = Interval.fromDateTimes(year2015, year2016);
    expect(interval1516.isValid).toBe(true);
    expect(interval1516.toDuration('year').years).toBe(1);
    expect(interval1516.toDuration('days').days).toBe(365);

    const interval1617 = Interval.fromDateTimes(year2016, year2017);
    expect(interval1617.isValid).toBe(true);
    expect(interval1617.toDuration('year').years).toBe(1);
    expect(interval1617.toDuration('days').days).toBe(366);

    const interval1718 = Interval.fromDateTimes(year2017, year2018);
    expect(interval1718.isValid).toBe(true);
    expect(interval1718.toDuration('year').years).toBe(1);
    expect(interval1718.toDuration('days').days).toBe(365);
  });
  test('manually compute correct duration (years)', () => {
    const data = [
      {
        key_as_string: '2018-12-31T00:00:00.000+01:00',
        key: 1546210800000,
        doc_count: 2502,
      },
      {
        key_as_string: '2019-01-07T00:00:00.000+01:00',
        key: 1546815600000,
        doc_count: 2919,
      },
      {
        key_as_string: '2019-01-14T00:00:00.000+01:00',
        key: 1547420400000,
        doc_count: 2919,
      },
      {
        key_as_string: '2019-01-21T00:00:00.000+01:00',
        key: 1548025200000,
        doc_count: 2919,
      },
      {
        key_as_string: '2019-01-28T00:00:00.000+01:00',
        key: 1548630000000,
        doc_count: 2918,
      },
      {
        key_as_string: '2019-02-04T00:00:00.000+01:00',
        key: 1549234800000,
        doc_count: 2920,
      },
      {
        key_as_string: '2019-02-11T00:00:00.000+01:00',
        key: 1549839600000,
        doc_count: 2918,
      },
      {
        key_as_string: '2019-02-18T00:00:00.000+01:00',
        key: 1550444400000,
        doc_count: 2920,
      },
      {
        key_as_string: '2019-02-25T00:00:00.000+01:00',
        key: 1551049200000,
        doc_count: 2918,
      },
      {
        key_as_string: '2019-03-04T00:00:00.000+01:00',
        key: 1551654000000,
        doc_count: 2920,
      },
      {
        key_as_string: '2019-03-11T00:00:00.000+01:00',
        key: 1552258800000,
        doc_count: 2919,
      },
      {
        key_as_string: '2019-03-18T00:00:00.000+01:00',
        key: 1552863600000,
        doc_count: 2919,
      },
      {
        key_as_string: '2019-03-25T00:00:00.000+01:00',
        key: 1553468400000,
        doc_count: 2919,
      },
      {
        key_as_string: '2019-04-01T00:00:00.000+02:00',
        key: 1554069600000,
        doc_count: 2919,
      },
      {
        key_as_string: '2019-04-02T00:00:00.000+02:00',
        key: DateTime.fromISO('2019-04-02T00:00:00.000+02:00').toMillis(),
        doc_count: 2919,
      },
      {
        key_as_string: '2019-04-09T00:00:00.000+02:00',
        key: DateTime.fromISO('2019-04-09T00:00:00.000+02:00').toMillis(),
        doc_count: 2085,
      },
    ];
    expect(computeMinTimeInterval(data.map((d) => d.key))).toBe(1);
  });
});

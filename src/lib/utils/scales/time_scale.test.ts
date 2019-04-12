import { DateTime, Interval } from 'luxon';

describe('time scale', () => {
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
    const start = DateTime.fromISO('2015-01-01T00:00:00.000Z');
    const data = [];
    for (let i = 0; i < 10; i++) {
      data.push(start.plus({ year: i }).toMillis());
    }
    expect(data).toBe([]);
  });
});

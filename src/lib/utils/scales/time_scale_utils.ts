import { DateTime, DurationObject, Interval } from 'luxon';

export function computeMinTimeInterval(data: number[]): DurationObject[] {
  const valuesLength = data.length;
  if (valuesLength <= 0) {
    return [{ millisecond: 0 }];
  }
  if (valuesLength === 1) {
    return [{ millisecond: 0 }];
  }
  const sortedValues = data.slice().sort();
  let i;
  const intervals: DurationObject[] = [];

  for (i = 1; i < valuesLength - 1; i++) {
    const current = DateTime.fromMillis(sortedValues[i]);
    const next = DateTime.fromMillis(sortedValues[i + 1]);
    const interval = Interval.fromDateTimes(current, next);
    const yearInterval = interval.toDuration('year').years;
    if (Number.isInteger(yearInterval)) {
      intervals.push({ year: yearInterval });
      continue;
    }
    const monthInterval = interval.toDuration('month').months;

    if (Number.isInteger(monthInterval)) {
      intervals.push({ month: monthInterval });
      continue;
    }
    const weekInterval = interval.toDuration('week').weeks;
    if (Number.isInteger(weekInterval)) {
      intervals.push({ week: weekInterval });
      continue;
    }
    const dayInterval = interval.toDuration('day').days;
    if (Number.isInteger(dayInterval)) {
      intervals.push({ day: dayInterval });
      continue;
    }
    const millisInterval = interval.toDuration('milliseconds').milliseconds;
    intervals.push({
      milliseconds: millisInterval,
    });
  }
  return intervals;
}

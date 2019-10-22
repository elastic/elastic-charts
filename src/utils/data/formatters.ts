import { TickFormatter, TickFormatterOptions } from '../../chart_types/xy_chart/utils/specs';
import { getMomentWithTz } from './date_time';
import moment from 'moment-timezone';

export function timeFormatter(format: string): TickFormatter {
  return (value: number, options?: TickFormatterOptions): string => {
    return getMomentWithTz(value, options && options.timeZone).format(format);
  };
}

export function niceTimeFormatter(domain: [number, number]): TickFormatter {
  const minDate = moment(domain[0]);
  const maxDate = moment(domain[1]);
  const diff = maxDate.diff(minDate, 'days');
  const format = niceTimeFormatByDay(diff);
  return timeFormatter(format);
}

export function niceTimeFormatByDay(days: number) {
  if (days > 30) {
    return 'yyyy-MM-dd';
  }
  if (days > 7 && days <= 30) {
    return 'MMMM dd';
  }
  if (days > 1 && days <= 7) {
    return 'MM-dd HH:mm';
  }
  return 'HH:mm:ss';
}

/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

export default {
  title: 'Scales',
};

export { Example as timezoneConfiguration } from './1_different_timezones.story';
export { Example as tooltipInLocalTimezone } from './2_local_tooltip.story';
export { Example as tooltipInUTC } from './3_utc_tooltip.story';
export { Example as specifiedTimezone } from './4_specified_timezone.story';
export { Example as removeDuplicateAxis } from './5_remove_duplicates.story';
export { Example as xScaleFallback } from './6_x_scale_fallback.story';
export { Example as logScaleOptions } from './7_log_scale_options.story';

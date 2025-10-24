/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

export default {
  title: 'Test Cases',
};

export { Example as noSeries } from './1_no_series.story';
export { Example as chromePathBugFix } from './2_chrome_path_bug_fix.story';
export { Example as noAxesAnnotationBugFix } from './3_no_axes_annotation.story';
export { Example as filterZerosInLogFitDomain } from './4_filter_zero_values_log.story';
export { Example as legendScrollBarSizing } from './5_legend_scroll_bar_sizing.story';
export { Example as accessibilityCustomizations } from './6_a11y_custom_description.story';
export { Example as rtlText } from './7_rtl_text.story';
export { Example as testPointsOutsideOfDomain } from './8_test_points_outside_of_domain.story';
export { Example as duplicateLabelsInPartitionLegend } from './9_duplicate_labels_in_partition_legend.story';
export { Example as highlighterZIndex } from './10_highlighter_z_index.story';
export { Example as domainEdges } from './21_domain_edges.story';
export { Example as metricTrendLength } from './22_metric_trend_length.story';
export { Example as startDayOfWeek } from './11_start_day_of_week.story';
export { Example as logWithNegativeValues } from './12_log_with_negative_values.story';
export { Example as pointStyleOverrides } from './13_point_style_overrides.story';
export { Example as errorBoundary } from './14_error_boundary.story';
export { Example as linearNicing } from './15_linear_nicing.story';
export { Example as lensStressTest } from './33_lens_stress.story';

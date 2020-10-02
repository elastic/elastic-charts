/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import 'path2d-polyfill';

export * from './components';
export { ChartTypes } from './chart_types';
export { ChartSize, ChartSizeArray, ChartSizeObject } from './utils/chart_size';

export { SpecId, GroupId, AxisId, AnnotationId } from './utils/ids';

// Everything related to the specs types and react-components
export * from './specs';
export { DebugState } from './state/types';
export { CurveType } from './utils/curves';
export { SimplePadding } from './utils/dimensions';
export { timeFormatter, niceTimeFormatter, niceTimeFormatByDay } from './utils/data/formatters';
export { Datum, Position, Rendering, Rotation, VerticalAlignment, HorizontalAlignment } from './utils/commons';
export { SeriesIdentifier } from './commons/series_id';
export { XYChartSeriesIdentifier, DataSeriesDatum, FilledValues } from './chart_types/xy_chart/utils/series';
export { AnnotationTooltipFormatter, CustomAnnotationTooltip } from './chart_types/xy_chart/annotations/types';
export { GeometryValue } from './utils/geometry';
export {
  Config as PartitionConfig,
  FillLabelConfig as PartitionFillLabel,
  PartitionLayout,
} from './chart_types/partition_chart/layout/types/config_types';
export { Config as HeatmapConfig } from './chart_types/heatmap/layout/types/config_types';
export { Layer as PartitionLayer } from './chart_types/partition_chart/specs/index';
export * from './chart_types/goal_chart/specs/index';
export {
  Accessor,
  AccessorFn,
  IndexedAccessorFn,
  UnaryAccessorFn,
  AccessorObjectKey,
  AccessorArrayIndex,
} from './utils/accessor';
export { CustomTooltip, TooltipInfo } from './components/tooltip/types';

// scales
export { ScaleType } from './scales/constants';

// theme
export * from './utils/themes/theme';
export * from './utils/themes/theme_commons';
export { LIGHT_THEME } from './utils/themes/light_theme';
export { DARK_THEME } from './utils/themes/dark_theme';

// utilities
export { RecursivePartial } from './utils/commons';
export { DataGenerator } from './utils/data_generators/data_generator';

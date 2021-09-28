/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { RecursivePartial, mergeOptionals } from '../utils/common';
import {
  GeometryStateStyle,
  RectBorderStyle,
  RectStyle,
  AreaStyle,
  LineStyle,
  PointStyle,
} from '../utils/themes/theme';

/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/** @internal */
export class MockStyles {
  static rect(partial: RecursivePartial<RectStyle> = {}): RectStyle {
    return mergeOptionals({ fill: 'blue', opacity: 1 }, partial);
  }

  static rectBorder(partial: RecursivePartial<RectBorderStyle> = {}): RectBorderStyle {
    return mergeOptionals({ visible: false, stroke: 'blue', strokeWidth: 1, strokeOpacity: 1 }, partial);
  }

  static area(partial: RecursivePartial<AreaStyle> = {}): AreaStyle {
    return mergeOptionals({ visible: true, fill: 'blue', opacity: 1 }, partial);
  }

  static line(partial: RecursivePartial<LineStyle> = {}): LineStyle {
    return mergeOptionals({ visible: true, stroke: 'blue', strokeWidth: 1, opacity: 1, dash: [1, 2, 1] }, partial);
  }

  static point(partial: RecursivePartial<PointStyle> = {}): PointStyle {
    return mergeOptionals(
      { visible: true, stroke: 'blue', strokeWidth: 1, fill: 'blue', opacity: 1, radius: 10 },
      partial,
    );
  }

  static geometryState(partial: RecursivePartial<GeometryStateStyle> = {}): GeometryStateStyle {
    return mergeOptionals({ opacity: 1 }, partial);
  }
}

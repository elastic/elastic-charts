/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { RecursivePartial } from '../utils/common';
import { mergePartial } from '../utils/common';
import type {
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
    return mergePartial({ fill: 'blue', opacity: 1 }, partial);
  }

  static rectBorder(partial: RecursivePartial<RectBorderStyle> = {}): RectBorderStyle {
    return mergePartial({ visible: false, stroke: 'blue', strokeWidth: 1, strokeOpacity: 1 }, partial);
  }

  static area(partial: RecursivePartial<AreaStyle> = {}): AreaStyle {
    return mergePartial({ visible: true, fill: 'blue', opacity: 1, dimmed: { opacity: 0.75 } }, partial);
  }

  static line(partial: RecursivePartial<LineStyle> = {}): LineStyle {
    return mergePartial(
      {
        visible: true,
        stroke: 'blue',
        strokeWidth: 1,
        opacity: 1,
        dash: [1, 2, 1],
        dimmed: { opacity: 0.75 },
        focused: { strokeWidth: 1 },
      },
      partial,
    );
  }

  static point(partial: RecursivePartial<PointStyle> = {}): PointStyle {
    return mergePartial(
      {
        visible: 'always',
        stroke: 'blue',
        strokeWidth: 1,
        fill: 'blue',
        opacity: 1,
        radius: 10,
        dimmed: { fill: 'gray', stroke: 'gray', opacity: 1 },
      },
      partial,
    );
  }

  static geometryState(partial: RecursivePartial<GeometryStateStyle> = {}): GeometryStateStyle {
    return mergePartial({ opacity: 1 }, partial);
  }
}

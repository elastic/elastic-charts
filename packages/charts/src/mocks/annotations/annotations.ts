/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getAnnotationLinePropsId } from '../../chart_types/xy_chart/annotations/line/dimensions';
import type { AnnotationLineProps } from '../../chart_types/xy_chart/annotations/line/types';
import type { AnnotationRectProps } from '../../chart_types/xy_chart/annotations/rect/types';
import type { RecursivePartial } from '../../utils/common';
import { mergePartial } from '../../utils/common';

/** @internal */
export class MockAnnotationLineProps {
  private static readonly base: AnnotationLineProps = {
    id: getAnnotationLinePropsId('spec1', { dataValue: 0 }, 0),
    specId: 'spec1',
    linePathPoints: { x1: 0, y1: 0, x2: 0, y2: 0 },
    panel: { top: 0, left: 0, width: 100, height: 100 },
    datum: { dataValue: 0 },
    markers: [],
  };

  static default(partial?: RecursivePartial<AnnotationLineProps>, smVerticalValue?: any, smHorizontalValue?: any) {
    const id = getAnnotationLinePropsId(
      partial?.specId ?? MockAnnotationLineProps.base.specId,
      {
        ...MockAnnotationLineProps.base.datum,
        ...partial?.datum,
      },
      0,
      smVerticalValue,
      smHorizontalValue,
    );
    return mergePartial<AnnotationLineProps>(MockAnnotationLineProps.base, { id, ...partial });
  }

  static fromPoints(x1 = 0, y1 = 0, x2 = 0, y2 = 0): AnnotationLineProps {
    return MockAnnotationLineProps.default({
      linePathPoints: { x1, y1, x2, y2 },
    });
  }

  static fromPartialAndId(partial?: RecursivePartial<AnnotationLineProps>) {
    return mergePartial<AnnotationLineProps>(MockAnnotationLineProps.base, partial);
  }
}

/** @internal */
export class MockAnnotationRectProps {
  private static readonly base: AnnotationRectProps = {
    id: 'testing',
    specId: 'rect',
    datum: { coordinates: { x0: 0, x1: 1, y0: 0, y1: 1 } },
    rect: { x: 0, y: 0, width: 0, height: 0 },
    panel: { width: 100, height: 100, top: 0, left: 0 },
  };

  static default(partial?: RecursivePartial<AnnotationRectProps>) {
    return mergePartial<AnnotationRectProps>(MockAnnotationRectProps.base, partial);
  }

  static fromValues(x = 0, y = 0, width = 0, height = 0): AnnotationRectProps {
    return MockAnnotationRectProps.default({ rect: { x, y, width, height } });
  }
}

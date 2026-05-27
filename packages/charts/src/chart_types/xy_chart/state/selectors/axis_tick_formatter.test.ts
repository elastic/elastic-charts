/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { withTickLabelTruncation } from './axis_tick_formatter';
import * as textUtils from '../../../../common/text_utils';
import { MockGlobalSpec } from '../../../../mocks/specs';
import { LIGHT_THEME } from '../../../../utils/themes/light_theme';

const {
  axes: { tickLabel },
} = LIGHT_THEME;

describe('withTickLabelTruncation', () => {
  const measure = jest.fn((text: string) => ({ width: text.length, height: tickLabel.fontSize }));
  const fitTextSpy = jest.spyOn(textUtils, 'fitText').mockReturnValue({ width: 0, text: 'tickLabel' });
  it('does not call fitText when maxLength is undefined', () => {
    const axisSpec = MockGlobalSpec.yAxis({ tickLabelMaxLength: undefined, tickLabelTruncate: 'end' });

    withTickLabelTruncation(measure, tickLabel, axisSpec, 200)((v: number) => `${v}`);
    expect(fitTextSpy).not.toHaveBeenCalled();
  });

  it("calls fitText with half the container width when maxLength is '50%'", () => {
    const containerWidth = 200;
    const axisSpec = MockGlobalSpec.yAxis({ tickLabelMaxLength: '50%', tickLabelTruncate: 'end' });
    const format = withTickLabelTruncation(measure, tickLabel, axisSpec, containerWidth)((v) => `${v}`);
    format('tickLabel');
    expect(fitTextSpy).toHaveBeenCalledWith(
      measure,
      'tickLabel',
      containerWidth / 2,
      tickLabel.fontSize,
      expect.any(Object),
      axisSpec.tickLabelTruncate ?? 'end',
    );
  });

  it('calls fitText with the numeric maxLength as maximum width', () => {
    const maxLengthPx = 72;
    const axisSpec = MockGlobalSpec.yAxis({ tickLabelMaxLength: maxLengthPx, tickLabelTruncate: 'end' });
    const format = withTickLabelTruncation(measure, tickLabel, axisSpec, 400)((v) => `${v}`);
    format('tickLabel');

    expect(fitTextSpy).toHaveBeenCalledWith(
      measure,
      'tickLabel',
      maxLengthPx,
      tickLabel.fontSize,
      expect.any(Object),
      axisSpec.tickLabelTruncate ?? 'end',
    );
  });
});

/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { renderPoints } from './points';
import { renderShape } from './primitives/shapes';
import { buildLineStyles } from './styles/line';
import { colorToRgba } from '../../../../common/color_library_wrappers';
import { MockPointGeometry } from '../../../../mocks/geometries';
import type { GeometryHighlightState } from '../../../../utils/geometry';
import { DARK_THEME } from '../../../../utils/themes/dark_theme';
import { LIGHT_THEME } from '../../../../utils/themes/light_theme';
import type { PointStyle } from '../../../../utils/themes/theme';
import { buildPointGeometryStyles } from '../../rendering/point_style';

jest.mock('./primitives/shapes');

const seriesColor = '#1750BA';
const renderPoint = (pointStyle: PointStyle, state: GeometryHighlightState) => {
  const point = {
    ...MockPointGeometry.default({ color: seriesColor }),
    style: buildPointGeometryStyles(seriesColor, pointStyle),
  };
  renderPoints({} as CanvasRenderingContext2D, [point], state, pointStyle, 1.5, 100, 20, true);
  const [, , , fill, stroke] = jest.mocked(renderShape).mock.calls[0]!;
  return { fill, stroke };
};

describe.each([
  ['light', LIGHT_THEME, '#FFFFFF'],
  ['dark', DARK_THEME, '#0B1628'],
] as const)('%s theme point strokes', (_, theme, dimmedFill) => {
  describe.each(['lineSeriesStyle', 'areaSeriesStyle'] as const)('%s', (seriesStyle) => {
    it.each(['default', 'focused', 'dimmed'] as const)('matches the line color in the %s state', (state) => {
      const { line, point } = theme[seriesStyle];
      const { fill, stroke } = renderPoint({ ...point, visible: 'always' }, state);
      expect(stroke?.color).toEqual(buildLineStyles(seriesColor, line, state).color);
      expect(fill?.color).toEqual(colorToRgba(state === 'dimmed' ? dimmedFill : theme.background.color));
    });
  });

  it('preserves a custom dimmed point stroke', () => {
    const { stroke } = renderPoint(
      {
        ...theme.lineSeriesStyle.point,
        visible: 'always',
        dimmed: { stroke: 'rgba(200, 10, 20, 0.6)', fill: theme.background.color },
      },
      'dimmed',
    );
    expect(stroke?.color).toEqual([200, 10, 20, 0.6]);
  });

  it('preserves opacity-only dimming', () => {
    const { stroke } = renderPoint(
      { ...theme.lineSeriesStyle.point, visible: 'always', dimmed: { opacity: 0.25 } },
      'dimmed',
    );
    expect(stroke?.color).toEqual([23, 80, 186, 0.25]);
  });
});

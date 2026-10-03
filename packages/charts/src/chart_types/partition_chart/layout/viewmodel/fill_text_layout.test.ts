/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { fillTextLayout, getRectangleRowGeometry, getSectorRowGeometry } from './fill_text_layout';
import { fillTextColor } from '../../../../common/fill_text_color';
import type { RingSectorConstruction } from '../../../../common/geometry';
import { VerticalAlignments } from '../../../../common/text_utils';
import type { Datum } from '../../../../utils/common';
import { LIGHT_THEME } from '../../../../utils/themes/light_theme';
import type { Layer } from '../../specs';
import type { QuadViewModel } from '../types/viewmodel_types';

describe('Test that getRectangleRowGeometry works with:', () => {
  const container = { x0: 0, y0: 0, x1: 200, y1: 100 };
  const cx = 0;
  const cy = 0;
  const totalRowCount = 1;
  const linePitch = 50;
  const rowIndex = 0;
  const fontSize = 50;
  const rotation = 0;
  const verticalAlignment = 'top';

  const defaultPadding = 2;
  const overhangOffset = -4.5;

  test('scalar, zero padding', () => {
    const padding = 0;
    const result = getRectangleRowGeometry(
      container,
      cx,
      cy,
      totalRowCount,
      linePitch,
      rowIndex,
      fontSize,
      rotation,
      verticalAlignment,
      padding,
    );
    // full container width is available; small Y offset for overhang
    expect(result).toEqual({
      maximumRowLength: 200,
      rowAnchorX: 0,
      rowAnchorY: overhangOffset,
    });
  });

  test('scalar, nonzero padding', () => {
    const padding = 10;
    const result = getRectangleRowGeometry(
      container,
      cx,
      cy,
      totalRowCount,
      linePitch,
      rowIndex,
      fontSize,
      rotation,
      verticalAlignment,
      padding,
    );
    // full container width is available; small Y offset for overhang
    expect(result).toEqual({
      maximumRowLength: 200 - padding * 2,
      rowAnchorX: 0,
      rowAnchorY: overhangOffset - padding,
    });
  });

  test('per-side, fully specified padding', () => {
    const padding = { top: 5, bottom: 10, left: 20, right: 30 };
    const result = getRectangleRowGeometry(
      container,
      cx,
      cy,
      totalRowCount,
      linePitch,
      rowIndex,
      fontSize,
      rotation,
      verticalAlignment,
      padding,
    );
    // full container width is available; small Y offset for overhang
    expect(result).toEqual({
      maximumRowLength: 200 - padding.left - padding.right,
      rowAnchorX: -5, // (left - right) / 2
      rowAnchorY: overhangOffset - padding.top,
    });
  });

  test('per-side, partially specified padding', () => {
    const padding = { bottom: 10, right: 30 };
    const result = getRectangleRowGeometry(
      container,
      cx,
      cy,
      totalRowCount,
      linePitch,
      rowIndex,
      fontSize,
      rotation,
      verticalAlignment,
      padding,
    );
    // full container width is available; small Y offset for overhang
    expect(result).toEqual({
      maximumRowLength: 200 - defaultPadding - padding.right,
      rowAnchorX: -(30 /* right padding */ / 2 - 2 /* 2: default left padding */ / 2),
      rowAnchorY: overhangOffset - defaultPadding,
    });
  });

  test('not enough height with per-side, partially specified padding', () => {
    const padding = { top: 80, bottom: 80 };
    const result = getRectangleRowGeometry(
      container,
      cx,
      cy,
      totalRowCount,
      linePitch,
      rowIndex,
      fontSize,
      rotation,
      verticalAlignment,
      padding,
    );
    // full container width is available; small Y offset for overhang
    expect(result).toEqual({
      maximumRowLength: 0, // Height of 100 - 2 * 80 < 50
      rowAnchorX: NaN, // if text can't be placed, what is its anchor?
      rowAnchorY: NaN, // if text can't be placed, what is its anchor?
    });
  });

  test('not enough height with per-side, asymmetric padding', () => {
    const padding = { top: 10, bottom: 50 };
    const result = getRectangleRowGeometry(
      container,
      cx,
      cy,
      totalRowCount,
      linePitch,
      rowIndex,
      fontSize,
      rotation,
      verticalAlignment,
      padding,
    );
    // full container width is available; small Y offset for overhang
    expect(result).toEqual({
      maximumRowLength: 0,
      rowAnchorX: NaN, // if text can't be placed, what is its anchor?
      rowAnchorY: NaN, // if text can't be placed, what is its anchor?
    });
  });

  test('just enough height to fit row with per-side, asymmetric padding', () => {
    const padding = { top: 10, bottom: 30 };
    const result = getRectangleRowGeometry(
      container,
      cx,
      cy,
      totalRowCount,
      linePitch,
      rowIndex,
      fontSize,
      rotation,
      verticalAlignment,
      padding,
    );
    // full container width is available; small Y offset for overhang
    expect(result).toEqual({
      maximumRowLength: 200 - 2 * defaultPadding, // Height of 100 - 2 * 80 < 50
      rowAnchorX: 0,
      rowAnchorY: overhangOffset - padding.top,
    });
  });

  test('two half-height rows also fit into the same area', () => {
    const padding = { top: 10, bottom: 30 };
    const smallFontSize = 25;
    const smallLinePitch = 25;
    const totalRowCount2 = 2;
    const rowIndex = 0;
    const smallOverhangOffset = -2.8125;
    const result = getRectangleRowGeometry(
      container,
      cx,
      cy,
      totalRowCount2,
      smallLinePitch,
      rowIndex,
      smallFontSize,
      rotation,
      verticalAlignment,
      padding,
    );
    // full container width is available; small Y offset for overhang
    expect(result).toEqual({
      maximumRowLength: 200 - 2 * defaultPadding, // Height of 100 - 2 * 80 < 50
      rowAnchorX: 0,
      rowAnchorY: smallOverhangOffset - padding.top,
    });
  });

  test('two half-height rows do not fit into the a slightly less high area', () => {
    const padding = { top: 10, bottom: 45 };
    const smallFontSize = 25;
    const smallLinePitch = 25;
    const totalRowCount2 = 2;
    const rowIndex = 0;
    const result = getRectangleRowGeometry(
      container,
      cx,
      cy,
      totalRowCount2,
      smallLinePitch,
      rowIndex,
      smallFontSize,
      rotation,
      verticalAlignment,
      padding,
    );
    // full container width is available; small Y offset for overhang
    expect(result).toEqual({
      maximumRowLength: 0, // Height of 100 - (10 + smallOverhangOffset) - 45  < totalRowCount2 * smallLinePitch
      rowAnchorX: NaN,
      rowAnchorY: NaN,
    });
  });

  test('paddingBottom correctly moves the row anchor with bottom alignment', () => {
    const padding = { top: 0, right: 0, bottom: 20, left: 0 };
    const smallFontSize = 25;
    const smallLinePitch = 25;
    const totalRowCount2 = 2;
    const rowIndex = 0;
    const result = getRectangleRowGeometry(
      container,
      cx,
      cy,
      totalRowCount2,
      smallLinePitch,
      rowIndex,
      smallFontSize,
      rotation,
      'bottom',
      padding,
    );
    // full container width is available; small Y offset for overhang
    expect(result).toEqual({
      maximumRowLength: 200,
      rowAnchorX: 0,
      rowAnchorY: -(
        (
          100 -
          smallLinePitch * (totalRowCount2 - 1 - rowIndex) -
          padding.bottom -
          smallFontSize * 0.05
        ) /* 0.05 = 5%: default overhang multiplier */
      ),
    });
  });
});
describe('Test fillTextColor function', () => {
  test('get the right maximized contrast color', () => {
    const fillColor = 'rgba(55, 126, 184, 0.7)';
    const containerBackgroundColor = 'white';
    const expectedAdjustedTextColor = 'rgba(0, 0, 0, 1)'; // with  WCAG 2 is black
    expect(fillTextColor(fillColor, containerBackgroundColor).color.keyword).toEqual(expectedAdjustedTextColor);
  });
});

const node = {
  dataName: 'aaaa bbbbbbbbbbbbbbbb ccccccccccccccccccccccc dddddddddddddddddd',
  depth: 1,
  value: 1,
  x0: 0,
  x1: 120,
  y0: 0,
  y1: 200,
  y0px: 0,
  y1px: 200,
  yMidPx: 100,
  textColor: 'black',
} as unknown as QuadViewModel;

// roughly 0.5em per character, so that long labels wrap over several rows
const measure = (text: string, _font: unknown, fontSize: number) => ({
  width: text.length * fontSize * 0.5,
  height: fontSize,
});

const VERTICAL_ALIGNMENTS = ['top', 'middle', 'bottom'] as const;
const FILL_LABEL_SCOPES = ['theme', 'layer'] as const;

type FillLabelScope = (typeof FILL_LABEL_SCOPES)[number];

type RowSetsArgs = {
  fillLabel?: Partial<(typeof LIGHT_THEME)['partition']['fillLabel']>;
  layerFillLabel?: Layer['fillLabel'];
  leftAlign?: boolean;
  middleAlign?: boolean;
  label?: string;
  sectorLayout?: boolean;
};

/** the ring of a sunburst root node, from which the sector row anchors and lengths are derived */
const ringSector: RingSectorConstruction = [{ x: 0, y: 0, r: 40, inside: false }];
const ringSectorOrigin: [number, number] = [-30, 0];

function rowSets({
  fillLabel,
  layerFillLabel,
  leftAlign = true,
  middleAlign = false,
  label = node.dataName,
  sectorLayout = false,
}: RowSetsArgs = {}) {
  const layout = sectorLayout
    ? fillTextLayout(
        () => ringSector,
        getSectorRowGeometry,
        () => 0,
        true,
      )
    : fillTextLayout(
        (n) => ({ x0: n.x0, x1: n.x1, y0: n.y0px, y1: n.y1px }),
        getRectangleRowGeometry,
        () => 0,
      );
  return layout(
    measure,
    () => `${label}`,
    () => 1,
    () => '', // no value label, keeping the tests focused on the row anchors
    [node],
    {
      ...LIGHT_THEME.partition,
      ...(fillLabel ? { fillLabel: { ...LIGHT_THEME.partition.fillLabel, ...fillLabel } } : {}),
    },
    [{ groupByRollup: (d: Datum) => d, ...(layerFillLabel ? { fillLabel: layerFillLabel } : {}) }],
    [sectorLayout ? ringSectorOrigin : [(node.x0 + node.x1) / 2, (node.y0px + node.y1px) / 2]],
    4,
    leftAlign,
    middleAlign,
  );
}

/** the theme fill label config, or the equivalent layer fill label config */
function fillLabelConfig(scope: FillLabelScope, config: Layer['fillLabel']): RowSetsArgs {
  return scope === 'theme' ? { fillLabel: config } : { layerFillLabel: config };
}

/** one case per scope and alignment pair, to check that both config scopes are honoured */
function fillLabelCases<A extends string>(alignments: readonly A[]): [FillLabelScope, A][] {
  return FILL_LABEL_SCOPES.flatMap((scope) => alignments.map((alignment) => [scope, alignment] as [FillLabelScope, A]));
}

describe('Test that fillTextLayout resolves the fill label vertical alignment', () => {
  it('defaults to top alignment for treemap-like layouts', () => {
    const [rowSet] = rowSets();
    expect(rowSet?.verticalAlignment).toEqual(VerticalAlignments.top);
    expect(rowSet?.rows[0]?.rowAnchorY).toBeLessThan(0);
  });

  it('defaults to middle alignment for icicle-like layouts', () => {
    const [rowSet] = rowSets({ middleAlign: true });
    expect(rowSet?.verticalAlignment).toEqual(VerticalAlignments.middle);
  });

  it.each(fillLabelCases(VERTICAL_ALIGNMENTS))('honours the %s alignment %s', (scope, alignment) => {
    const [rowSet] = rowSets(fillLabelConfig(scope, { verticalAlignment: alignment }));
    expect(rowSet?.verticalAlignment).toEqual(alignment);
  });

  it('prefers the layer fill label over the theme fill label', () => {
    const [rowSet] = rowSets({
      fillLabel: { verticalAlignment: 'middle' },
      layerFillLabel: { verticalAlignment: 'bottom' },
    });
    expect(rowSet?.verticalAlignment).toEqual(VerticalAlignments.bottom);
  });

  it('ignores the configured alignment for sunburst and pie layouts', () => {
    // sunburst and pie labels are always centered, so a configured alignment must not displace them
    const [rowSet] = rowSets({
      sectorLayout: true,
      leftAlign: false,
      middleAlign: true,
      label: 'aa bb cc dd', // a short label, which fits within the sector
      fillLabel: { verticalAlignment: 'bottom' },
    });
    expect(rowSet?.rows.length).toBeGreaterThan(0); // the label must actually fit for this to be meaningful
    expect(rowSet?.verticalAlignment).toEqual(VerticalAlignments.middle);
  });
});

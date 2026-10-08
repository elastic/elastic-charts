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
import { HorizontalAlignment, VerticalAlignments } from '../../../../common/text_utils';
import type { Datum } from '../../../../utils/common';
import { LIGHT_THEME } from '../../../../utils/themes/light_theme';
import type { FillLabelHorizontalAlignment } from '../../../../utils/themes/partition';
import { getCurrentRowX } from '../../renderer/canvas/canvas_renderers';
import type { Layer } from '../../specs';
import type { QuadViewModel, TextRow } from '../types/viewmodel_types';

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

  describe('middle alignment centers the label block in the container', () => {
    test('single row sits on the container midpoint, ignoring padding', () => {
      const singleRowResult = getRectangleRowGeometry(container, cx, cy, 1, 50, 0, 50, rotation, 'middle', 0);
      expect(singleRowResult.rowAnchorY).toEqual(-50); // -((y0 + y1) / 2)

      const paddedResult = getRectangleRowGeometry(container, cx, cy, 1, 50, 0, 50, rotation, 'middle', {
        top: 0,
        right: 0,
        bottom: 20,
        left: 0,
      });
      expect(paddedResult.rowAnchorY).toEqual(-50);
    });

    test('multiple rows are spread symmetrically around the container midpoint', () => {
      const pitch = 25;
      const rowAnchorYs = [0, 1, 2].map(
        (row) => getRectangleRowGeometry(container, cx, cy, 3, pitch, row, pitch, rotation, 'middle', 0).rowAnchorY,
      );
      // centered on the container midpoint, with the rows one line pitch apart
      expect(rowAnchorYs).toEqual([-25, -50, -75]);
    });

    test('multiple rows do not fit when the container is too short', () => {
      const result = getRectangleRowGeometry(container, cx, cy, 3, 50, 0, 50, rotation, 'middle', 0);
      expect(result).toEqual({ maximumRowLength: 0, rowAnchorX: NaN, rowAnchorY: NaN });
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
  middleAlign = false,
  label = node.dataName,
  sectorLayout = false,
}: RowSetsArgs = {}) {
  const layout = sectorLayout
    ? fillTextLayout(
        () => ringSector,
        getSectorRowGeometry,
        () => 0,
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
    sectorLayout,
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

  it('centers a wrapped label block on the container midpoint', () => {
    const [rowSet] = rowSets({ fillLabel: { verticalAlignment: 'middle' } });
    const rows = rowSet?.rows ?? [];
    expect(rows.length).toBeGreaterThan(1); // the label must actually wrap for this to be meaningful
    const anchors = rows.map(({ rowAnchorY }) => -rowAnchorY);
    const [first, last] = [anchors[0] as number, anchors.at(-1) as number];
    expect((first + last) / 2).toEqual((node.y0px + node.y1px) / 2);
    // rows are evenly spaced by one line pitch
    anchors.slice(1).forEach((anchor, i) => expect(anchor - (anchors[i] as number)).toEqual(rowSet?.fontSize));
  });

  it('puts a single row label on the container midpoint with middle alignment', () => {
    const [rowSet] = rowSets({
      fillLabel: { verticalAlignment: 'middle' },
      label: 'short label',
    });
    expect(rowSet?.rows).toHaveLength(1);
    expect(-(rowSet?.rows[0]?.rowAnchorY as number)).toBeCloseTo((node.y0px + node.y1px) / 2);
  });

  it('ignores the configured alignment for sunburst and pie layouts', () => {
    // sunburst and pie labels are always centered, so a configured alignment must not displace them
    const [rowSet] = rowSets({
      sectorLayout: true,
      middleAlign: true,
      label: 'aa bb cc dd', // a short label, which fits within the sector
      fillLabel: { verticalAlignment: 'bottom' },
    });
    expect(rowSet?.rows.length).toBeGreaterThan(0); // the label must actually fit for this to be meaningful
    expect(rowSet?.verticalAlignment).toEqual(VerticalAlignments.middle);
  });
});

const HORIZONTAL_ALIGNMENTS = ['left', 'center', 'right'] as const;

describe('Test that fillTextLayout resolves the fill label horizontal alignment', () => {
  it('defaults to left alignment for treemap-like layouts', () => {
    const [rowSet] = rowSets();
    expect(rowSet?.horizontalAlignment).toEqual(HorizontalAlignment.left);
  });

  it('defaults to center alignment for sunburst-like layouts', () => {
    const [rowSet] = rowSets({ sectorLayout: true, middleAlign: true, label: 'aa bb cc dd' });
    expect(rowSet?.horizontalAlignment).toEqual(HorizontalAlignment.center);
  });

  it.each(fillLabelCases(HORIZONTAL_ALIGNMENTS))('honours the %s alignment %s', (scope, alignment) => {
    const [rowSet] = rowSets(fillLabelConfig(scope, { horizontalAlignment: alignment }));
    expect(rowSet?.horizontalAlignment).toEqual(alignment);
  });

  it('prefers the layer fill label over the theme fill label', () => {
    const [rowSet] = rowSets({
      fillLabel: { horizontalAlignment: 'left' },
      layerFillLabel: { horizontalAlignment: 'center' },
    });
    expect(rowSet?.horizontalAlignment).toEqual(HorizontalAlignment.center);
  });

  it('mirrors the alignment for right-to-left labels', () => {
    const [rowSet] = rowSets({
      fillLabel: { horizontalAlignment: 'left' },
      label: 'مرحبا',
    });
    expect(rowSet?.horizontalAlignment).toEqual(HorizontalAlignment.right);
  });

  it('ignores the configured alignment for sunburst and pie layouts', () => {
    const [rowSet] = rowSets({
      sectorLayout: true,
      middleAlign: true,
      label: 'aa bb cc dd', // a short label, which fits within the sector
      fillLabel: { horizontalAlignment: 'left' },
    });
    expect(rowSet?.rows.length).toBeGreaterThan(0); // the label must actually fit for this to be meaningful
    expect(rowSet?.horizontalAlignment).toEqual(HorizontalAlignment.center);
    // the label starts where it would if it were centered on its anchor, i.e. it is not displaced off canvas
    const [row] = rowSet?.rows ?? [];
    expect(getCurrentRowX(row as TextRow, HorizontalAlignment.center, 0) + (row?.length ?? 0) / 2).toEqual(
      row?.rowAnchorX,
    );
  });

  it('centers every wrapped row of a multi-row label individually', () => {
    const [rowSet] = rowSets({ fillLabel: { horizontalAlignment: 'center' } });
    const rows = rowSet?.rows ?? [];
    expect(rows.length).toBeGreaterThan(1); // the label must actually wrap for this to be meaningful
    expect(new Set(rows.map((row) => row.length)).size).toBeGreaterThan(1); // rows of differing widths, i.e. not all full width
    rows.forEach((row) => {
      expect(getCurrentRowX(row, HorizontalAlignment.center, 0) + row.length / 2).toEqual(row.rowAnchorX);
      expect(row.rowAnchorX).toEqual((node.x0 + node.x1) / 2);
    });
  });

  it('left aligns every wrapped row of a multi-row label on the same edge', () => {
    const [rowSet] = rowSets();
    const rows = rowSet?.rows ?? [];
    expect(rows.length).toBeGreaterThan(1);
    expect(new Set(rows.map((row) => getCurrentRowX(row, HorizontalAlignment.left, 0))).size).toEqual(1);
  });

  describe('row positions respect the horizontal padding', () => {
    const padding = { top: 0, right: 30, bottom: 0, left: 10 };
    const paddedAreaMidX = (node.x0 + padding.left + node.x1 - padding.right) / 2;
    // a short label, so that the words fit within the narrower padded area
    const paddedRow = (horizontalAlignment: FillLabelHorizontalAlignment) =>
      rowSets({ fillLabel: { horizontalAlignment, padding }, label: 'aa bb cc dd' })[0]?.rows[0] as TextRow;

    it.each(HORIZONTAL_ALIGNMENTS)('anchors %s aligned rows on the padding edge', (alignment) => {
      const row = paddedRow(alignment);
      // the text start, text center and text end of the row, all as placed by the renderer
      const placed = {
        left: getCurrentRowX(row, HorizontalAlignment.left, 0),
        center: getCurrentRowX(row, HorizontalAlignment.center, 0) + row.length / 2,
        right: getCurrentRowX(row, HorizontalAlignment.right, 0) + row.length,
      };
      const expected = {
        left: node.x0 + padding.left,
        center: paddedAreaMidX,
        right: node.x1 - padding.right,
      };
      expect(placed[alignment]).toEqual(expected[alignment]);
      expect(row.rowAnchorX).toEqual(paddedAreaMidX);
    });
  });
});

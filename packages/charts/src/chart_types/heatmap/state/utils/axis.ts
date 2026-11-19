/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { scaleBand } from 'd3-scale';

import type { Radian } from '../../../../common/geometry';
import { extent } from '../../../../common/math';
import type { Vec2 } from '../../../../common/vectors';
import { rotate2, sub2 } from '../../../../common/vectors';
import type { LabelSpan } from '../../../../solvers/label_overlaps';
import { hasOverlappingLabels } from '../../../../solvers/label_overlaps';
import { screenspaceMarkerScaleCompressor } from '../../../../solvers/screenspace_marker_scale_compressor';
import type { TextMeasure } from '../../../../utils/bbox/canvas_text_bbox_calculator';
import { isFiniteNumber, degToRad } from '../../../../utils/common';
import type { Size } from '../../../../utils/dimensions';
import { horizontalPad, innerPad, outerPad, pad, verticalPad } from '../../../../utils/dimensions';
import type { HeatmapStyle, AxisStyle } from '../../../../utils/themes/theme';
import type { PrimitiveValue } from '../../../partition_chart/layout/utils/group_by_rollup';
import type { HeatmapSpec } from '../../specs';
import type { HeatmapTable } from '../selectors/get_heatmap_table';

/** @internal */
export type MeasuredLabel = Size & { label: NonNullable<PrimitiveValue> };

/** @internal */
export type CompressedScale = Size & {
  left: number;
  right: number;
  overlaps: boolean;
  overflow: { left: boolean; right: boolean };
  /** the horizontal space occupied by each label, padding included, on the compressed scale */
  labelSpans: LabelSpan[];
};

/** @internal */
export function getYAxisHorizontalUsedSpace(
  yValues: HeatmapTable['yValues'],
  style: HeatmapStyle['yAxisLabel'],
  formatter: HeatmapSpec['yAxisLabelFormatter'],
  textMeasure: TextMeasure,
): number {
  if (!style.visible) {
    return 0;
  }
  if (typeof style.width === 'number' && isFiniteNumber(style.width)) {
    return style.width;
  }
  // account for the space required to show the longest Y axis label
  const longestLabelWidth = yValues.reduce<number>((acc, value) => {
    const { width } = textMeasure(formatter(value), style, style.fontSize);
    return Math.max(width + horizontalPad(style.padding), acc);
  }, 0);

  return style.width === 'auto' ? longestLabelWidth : Math.min(longestLabelWidth, style.width.max);
}

/**
 * Returns how many Y rows sit between two visible labels.
 * The labels are identical and evenly spaced, so the cadence is the label height divided by the row height.
 * @internal
 */
export function getYAxisTickCadence(
  style: HeatmapStyle['yAxisLabel'],
  panelHeight: number,
  valuesCount: number,
): number {
  const rowHeight = panelHeight / valuesCount;
  if (!isFiniteNumber(rowHeight) || rowHeight <= 0) {
    return 1;
  }
  const labelHeight = style.fontSize + verticalPad(style.padding);
  return Math.min(valuesCount, Math.max(1, Math.ceil(labelHeight / rowHeight)));
}

/** @internal */
export function getTextSizeDimension(
  text: string,
  style: AxisStyle['axisTitle'],
  textMeasure: TextMeasure,
  param: 'height' | 'width',
  hidden = false,
): number {
  if (!style.visible || text === '' || hidden) {
    return 0;
  }
  const textPadding = innerPad(style.padding) + outerPad(style.padding);
  if (param === 'height') {
    return style.fontSize + textPadding;
  }

  const textBox = textMeasure(
    text,
    {
      fontFamily: style.fontFamily,
      fontVariant: 'normal',
      fontWeight: 'bold',
      fontStyle: style.fontStyle ?? 'normal',
    },
    style.fontSize,
  );
  return textBox.width + textPadding;
}

/** @internal */
export function getXAxisSize(
  isCategoricalScale: boolean,
  style: HeatmapStyle['xAxisLabel'],
  formatter: HeatmapSpec['xAxisLabelFormatter'],
  labels: (string | number)[],
  textMeasure: TextMeasure,
  containerWidth: number,
  surroundingSpace: [left: number, right: number],
  showOverlappingLabels: boolean,
): Size & { right: number; left: number; tickCadence: number; minRotation: Radian } {
  if (!style.visible) {
    return {
      height: 0,
      width: Math.max(containerWidth - surroundingSpace[0] - surroundingSpace[1], 0),
      left: surroundingSpace[0],
      right: surroundingSpace[1],
      tickCadence: NaN,
      minRotation: 0,
    };
  }
  const isRotated = style.rotation !== 0;
  const normalizedScale = scaleBand<NonNullable<PrimitiveValue>>().domain(labels).range([0, 1]);

  const alignment = isRotated ? 'right' : isCategoricalScale ? 'center' : 'left';
  const alignmentOffset = isCategoricalScale ? normalizedScale.bandwidth() / 2 : 0;
  const scale = (d: NonNullable<PrimitiveValue>) => (normalizedScale(d) ?? 0) + alignmentOffset;

  // use positive angle from 0 to 90 only
  const rotationRad = degToRad(style.rotation);

  const measuredLabels: MeasuredLabel[] = labels.map((label) => ({
    ...textMeasure(formatter(label), style, style.fontSize),
    label,
  }));

  if (isCategoricalScale || isRotated) {
    const maxLabelBBox = measuredLabels.reduce(
      (acc, curr) => {
        return {
          height: Math.max(acc.height, curr.height),
          width: Math.max(acc.width, curr.width),
        };
      },
      { height: 0, width: 0 },
    );
    const compressedScale = computeCompressedScale(
      style,
      scale,
      measuredLabels,
      containerWidth,
      surroundingSpace,
      alignment,
      rotationRad,
    );
    const scaleStep = compressedScale.width / labels.length;
    // this optimal rotation is computed on a suboptimal compressed scale, it can be further enhanced with a monotonic hill climber
    const optimalRotation =
      scaleStep > maxLabelBBox.width ? 0 : Math.asin(Math.min(maxLabelBBox.height / scaleStep, 1));
    // if the current requested rotation is not at least bigger then the optimal one, recalculate the compression
    // using the optimal one forcing the rotation to be without overlaps
    const minRotation = isRotated ? Math.max(optimalRotation, rotationRad) : 0;
    const dimension =
      minRotation === rotationRad
        ? compressedScale
        : computeCompressedScale(
            style,
            scale,
            measuredLabels,
            containerWidth,
            surroundingSpace,
            alignment,
            minRotation,
          );

    const validCompression = isFiniteNumber(dimension.width);
    // The flag only applies to categorical scales. Rotated time labels stay visible: raising the
    // rotation already separates the glyphs, and a slanted label's horizontal box overlaps its
    // neighbor before the text does. The same holds for a rotated categorical axis once the font
    // height fits in the step. At 90° that box is the font height, so a remaining collision is real.
    const showEveryLabel = isCategoricalScale && showOverlappingLabels;
    const rotationClearsLabels = isRotated && maxLabelBBox.height < scaleStep;
    if (!validCompression || showEveryLabel || !isCategoricalScale || rotationClearsLabels) {
      return axisSizeFromCompression(dimension, 1, minRotation, containerWidth, surroundingSpace);
    }

    // refit with only the labels kept at each cadence, so a hidden label no longer sets the width or insets.
    // a label that sets the right edge is already inside the fitted bound
    const fitted = fitCompressedScaleByCadence({
      style,
      scale,
      labels: measuredLabels,
      containerWidth,
      surroundingSpace,
      alignment,
      rotation: minRotation,
      dimension,
      hideRightOverflow: false,
    });
    return axisSizeFromCompression(fitted.dimension, fitted.tickCadence, minRotation, containerWidth, surroundingSpace);
  }

  const compressedScale = computeCompressedScale(
    style,
    scale,
    measuredLabels,
    containerWidth,
    surroundingSpace,
    alignment,
    rotationRad,
  );
  // a time label that sets the right edge still draws past the container
  const fitted = fitCompressedScaleByCadence({
    style,
    scale,
    labels: measuredLabels,
    containerWidth,
    surroundingSpace,
    alignment,
    rotation: rotationRad,
    dimension: compressedScale,
    hideRightOverflow: true,
  });

  return axisSizeFromCompression(fitted.dimension, fitted.tickCadence, rotationRad, containerWidth, surroundingSpace);
}

interface FitCompressedScaleArgs {
  style: HeatmapStyle['xAxisLabel'];
  scale: (d: NonNullable<PrimitiveValue>) => number;
  labels: MeasuredLabel[];
  containerWidth: number;
  surroundingSpace: [number, number];
  alignment: 'left' | 'right' | 'center';
  rotation: Radian;
  dimension: CompressedScale;
  /**
   * Time axes only. A label that sets the right edge still draws past the container.
   * Categorical axes already treat that edge as the fitted bound.
   */
  hideRightOverflow: boolean;
}

/**
 * Increases the tick cadence until the visible labels fit in the container.
 * Each attempt compresses the scale with only the labels that stay visible,
 * so hidden labels stop taking width and insets.
 */
function fitCompressedScaleByCadence({
  style,
  scale,
  labels,
  containerWidth,
  surroundingSpace,
  alignment,
  rotation,
  dimension,
  hideRightOverflow,
}: FitCompressedScaleArgs): { dimension: CompressedScale; tickCadence: number } {
  let tickCadence = 1;
  let fitted = dimension;

  // TODO refactor and move to monotonic hill climber and no mutations
  for (let i = 1; i < labels.length; i++) {
    // overflow.right names the label that set the compressed right edge. On a time axis that
    // label still sticks past the container, so the cadence has to rise. On a categorical axis
    // the edge is already the fitted bound, and a label that sets it without overlapping stays visible.
    const exceedsRightBound = hideRightOverflow && fitted.overflow.right;
    if ((!hasOverlappingLabels(fitted.labelSpans) && !exceedsRightBound) || !isFiniteNumber(fitted.width)) {
      break;
    }
    fitted = computeCompressedScale(
      style,
      scale,
      labels.filter((_, index) => index % (i + 1) === 0),
      containerWidth,
      surroundingSpace,
      alignment,
      rotation,
    );
    tickCadence++;
  }

  return { dimension: fitted, tickCadence };
}

function axisSizeFromCompression(
  dimension: CompressedScale,
  tickCadence: number,
  minRotation: Radian,
  containerWidth: number,
  surroundingSpace: [number, number],
): Size & { right: number; left: number; tickCadence: number; minRotation: Radian } {
  // hide the axis because there is no space for labels
  if (!isFiniteNumber(dimension.width)) {
    return {
      // hide the whole axis
      height: 0,
      width: Math.max(containerWidth - surroundingSpace[0] - surroundingSpace[1], 0),
      left: surroundingSpace[0],
      right: surroundingSpace[1],
      // hide all ticks
      tickCadence: NaN,
      minRotation,
    };
  }

  return {
    height: dimension.height,
    width: dimension.width,
    left: dimension.left,
    right: dimension.right,
    tickCadence,
    minRotation,
  };
}

function computeCompressedScale(
  style: HeatmapStyle['xAxisLabel'],
  scale: (d: NonNullable<PrimitiveValue>) => number,
  labels: MeasuredLabel[],
  containerWidth: number,
  surroundingSpace: [number, number],
  alignment: 'left' | 'right' | 'center',
  rotation: Radian,
): CompressedScale {
  const { itemsPerSideSize, domainPositions, hMax } = labels.reduce<{
    wMax: number;
    hMax: number;
    itemsPerSideSize: [number, number][];
    domainPositions: number[];
  }>(
    (acc, { width, height, label }) => {
      // rotate the label box coordinates
      const labelRect: Vec2[] = [
        [0, 0],
        [width, 0],
        [width, height],
        [0, height],
      ];

      const rotationOrigin: Vec2 =
        alignment === 'right' ? [width, height / 2] : alignment === 'left' ? [0, height / 2] : [width / 2, height / 2];

      const rotatedVectors = labelRect.map((vector) => rotate2(rotation, sub2(vector, rotationOrigin)));

      // find the rotated bounding box
      const x = extent(rotatedVectors.map((v) => v[0]));
      const y = extent(rotatedVectors.map((v) => v[1]));
      acc.wMax = Math.max(acc.wMax, Math.abs(x[1] - x[0]));
      acc.hMax = Math.max(acc.hMax, Math.abs(y[1] - y[0]));

      // describe the item width as the left and right vector size from the rotation origin
      acc.itemsPerSideSize.push([Math.abs(x[0]), Math.abs(x[1])]);

      // use a categorical scale with labels aligned to the center to compute the domain position
      const domainPosition = scale(label);
      acc.domainPositions.push(domainPosition);
      return acc;
    },
    { wMax: -Infinity, hMax: -Infinity, itemsPerSideSize: [], domainPositions: [] },
  );

  // account for the left and right space (Y axes, overflows etc)
  const globalDomainPositions = [0, ...domainPositions, 1];
  const globalItemWidth: [number, number][] = [[surroundingSpace[0], 0], ...itemsPerSideSize, [0, surroundingSpace[1]]];

  const { scaleMultiplier, bounds } = screenspaceMarkerScaleCompressor(
    globalDomainPositions,
    globalItemWidth,
    containerWidth,
  );

  // check label overlaps using the computed compressed scale
  const overlaps = itemsPerSideSize.some(([, rightSide], i) => {
    if (i >= itemsPerSideSize.length - 1) {
      return false;
    }

    const currentItemRightSide = (domainPositions[i] ?? 0) * scaleMultiplier + rightSide + pad(style.padding, 'right');
    const nextItemLeftSize =
      (domainPositions[i + 1] ?? 0) * scaleMultiplier -
      (itemsPerSideSize[i + 1]?.[0] ?? 0) -
      pad(style.padding, 'left');
    return currentItemRightSide > nextItemLeftSize;
  });

  const leftMargin = isFiniteNumber(bounds[0])
    ? (globalItemWidth[bounds[0]]?.[0] ?? 0) - scaleMultiplier * (globalDomainPositions[bounds[0]] ?? 0)
    : 0;
  const rightMargin = isFiniteNumber(bounds[1]) ? globalItemWidth[bounds[1]]?.[1] ?? 0 : 0;

  const labelSpans = itemsPerSideSize.map<LabelSpan>(([leftSide, rightSide], i) => ({
    position: (domainPositions[i] ?? 0) * scaleMultiplier,
    before: leftSide + pad(style.padding, 'left'),
    after: rightSide + pad(style.padding, 'right'),
  }));

  return {
    // the horizontal space
    width: scaleMultiplier,
    right: rightMargin,
    left: leftMargin,
    // the height represent the height of the max rotated bbox plus the padding and the vertical position of the rotation origin
    height: hMax + pad(style.padding, 'top') + style.fontSize / 2,
    overlaps,
    labelSpans,
    overflow: {
      // true if a label exist protrude to the left making the scale shrink from the left
      // the current check is based on the way we construct globalItemWidth and globalDomainPositions
      left: bounds[0] !== 0,
      // true if a label exist protrude to the right making the scale shrink from the right
      // the current check is based on the way we construct globalItemWidth and globalDomainPositions
      right: bounds[1] !== globalDomainPositions.length - 1,
    },
  };
}

/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { colorToRgba, overrideOpacity, RGBATupleToString } from '../../../../common/color_library_wrappers';
import { LegendItem } from '../../../../common/legend';
import { Fill, Rect, Stroke } from '../../../../geoms/types';
import { withContext } from '../../../../renderers/canvas';
import { ColorVariant, Rotation } from '../../../../utils/common';
import { Dimensions } from '../../../../utils/dimensions';
import { AreaGeometry, PerPanel } from '../../../../utils/geometry';
import { SharedGeometryStateStyle } from '../../../../utils/themes/theme';
import { getGeometryStateStyle } from '../../rendering/utils';
import { getTextureStyles } from '../../utils/texture';
import { renderPoints } from './points';
import { renderLinePaths, renderAreaPath } from './primitives/path';
import { buildAreaStyles } from './styles/area';
import { buildLineStyles } from './styles/line';
import { withPanelTransform } from './utils/panel_transform';

interface AreaGeometriesProps {
  areas: Array<PerPanel<AreaGeometry>>;
  sharedStyle: SharedGeometryStateStyle;
  rotation: Rotation;
  renderingArea: Dimensions;
  highlightedLegendItem?: LegendItem;
  clippings: Rect;
}

/** @internal */
export function renderAreas(ctx: CanvasRenderingContext2D, imgCanvas: HTMLCanvasElement, props: AreaGeometriesProps) {
  const { sharedStyle, highlightedLegendItem, areas, rotation, clippings, renderingArea } = props;

  withContext(ctx, () => {
    areas.forEach(({ panel, value: area }) => {
      const { seriesAreaLineStyle, seriesAreaStyle } = area;
      if (seriesAreaStyle.visible) {
        withPanelTransform(
          ctx,
          panel,
          rotation,
          renderingArea,
          () => renderArea(ctx, imgCanvas, area, sharedStyle, clippings, highlightedLegendItem),
          { area: clippings, shouldClip: true },
        );
      }
      if (seriesAreaLineStyle.visible) {
        withPanelTransform(
          ctx,
          panel,
          rotation,
          renderingArea,
          () => renderAreaLines(ctx, area, sharedStyle, clippings, highlightedLegendItem),
          { area: clippings, shouldClip: true },
        );
      }
    });

    areas.forEach(({ panel, value: area }) => {
      const { seriesPointStyle, seriesIdentifier, points } = area;
      const visiblePoints = seriesPointStyle.visible ? points : points.filter(({ orphan }) => orphan);
      if (visiblePoints.length === 0) {
        return;
      }
      const geometryStateStyle = getGeometryStateStyle(seriesIdentifier, sharedStyle, highlightedLegendItem);
      withPanelTransform(
        ctx,
        panel,
        rotation,
        renderingArea,
        () => renderPoints(ctx, visiblePoints, geometryStateStyle),
        { area: clippings, shouldClip: points[0]?.value.mark !== null },
      );
    });
  });
}

function renderArea(
  ctx: CanvasRenderingContext2D,
  imgCanvas: HTMLCanvasElement,
  geometry: AreaGeometry,
  sharedStyle: SharedGeometryStateStyle,
  clippings: Rect,
  highlightedLegendItem?: LegendItem,
) {
  const {
    area,
    color,
    transform,
    seriesIdentifier,
    seriesAreaStyle,
    fitStyle,
    clippedRanges,
    hideClippedRanges,
  } = geometry;
  const geometryStateStyle = getGeometryStateStyle(seriesIdentifier, sharedStyle, highlightedLegendItem);
  const areaFill = buildAreaStyles(ctx, imgCanvas, color, seriesAreaStyle, geometryStateStyle);

  const fitAreaFillColor = fitStyle.area.color === ColorVariant.Series ? colorToRgba(color) : fitStyle.area.color;
  const fitAreaFill: Fill = {
    texture: getTextureStyles(
      ctx,
      imgCanvas,
      RGBATupleToString(fitAreaFillColor),
      geometryStateStyle.opacity,
      fitStyle.area.texture,
    ),
    color: overrideOpacity(fitAreaFillColor, (opacity) => opacity * geometryStateStyle.opacity * fitStyle.area.opacity),
  };

  renderAreaPath(
    ctx,
    transform,
    area,
    areaFill,
    fitAreaFill,
    clippedRanges,
    clippings,
    hideClippedRanges || !fitStyle.area.visible,
  );
}

function renderAreaLines(
  ctx: CanvasRenderingContext2D,
  geometry: AreaGeometry,
  sharedStyle: SharedGeometryStateStyle,
  clippings: Rect,
  highlightedLegendItem?: LegendItem,
) {
  const {
    lines,
    color,
    seriesIdentifier,
    transform,
    seriesAreaLineStyle,
    clippedRanges,
    hideClippedRanges,
    fitStyle,
  } = geometry;
  const geometryStateStyle = getGeometryStateStyle(seriesIdentifier, sharedStyle, highlightedLegendItem);
  const lineStyle = buildLineStyles(color, seriesAreaLineStyle, geometryStateStyle);

  const fitLineStrokeColor = fitStyle.line.color === ColorVariant.Series ? colorToRgba(color) : fitStyle.line.color;

  const fitLineStroke: Stroke = {
    dash: fitStyle.line.dash,
    width: seriesAreaLineStyle.strokeWidth,
    color: overrideOpacity(
      fitLineStrokeColor,
      (opacity) => opacity * geometryStateStyle.opacity * fitStyle.line.opacity,
    ),
  };

  renderLinePaths(
    ctx,
    transform,
    lines,
    lineStyle,
    fitLineStroke,
    clippedRanges,
    clippings,
    hideClippedRanges || !fitStyle.line.visible,
  );
}

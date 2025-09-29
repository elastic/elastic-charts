/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';
import { connect } from 'react-redux';

import { RGBATupleToString } from '../../../../common/color_library_wrappers';
import type { GlobalChartState } from '../../../../state/chart_state';
import { getChartRotationSelector } from '../../../../state/selectors/get_chart_rotation';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { InitStatus, getInternalIsInitializedSelector } from '../../../../state/selectors/get_internal_is_intialized';
import { isBrushingSelector } from '../../../../state/selectors/is_brushing';
import type { Rotation } from '../../../../utils/common';
import { getColorFromVariant } from '../../../../utils/common';
import type { Dimensions } from '../../../../utils/dimensions';
import type { IndexedGeometry, PointGeometry } from '../../../../utils/geometry';
import { isPointGeometry, isBarGeometry } from '../../../../utils/geometry';
import { LIGHT_THEME } from '../../../../utils/themes/light_theme';
import type { HighlighterStyle } from '../../../../utils/themes/theme';
import { computeChartDimensionsSelector } from '../../state/selectors/compute_chart_dimensions';
import { computeChartTransformSelector } from '../../state/selectors/compute_chart_transform';
import { getHighlightedGeomsSelector } from '../../state/selectors/get_tooltip_values_highlighted_geoms';
import type { Transform } from '../../state/utils/types';
import { computeChartTransform } from '../../state/utils/utils';
import { ShapeRendererFn } from '../shapes_paths';

interface HighlighterProps {
  initialized: boolean;
  chartId: string;
  zIndex: number;
  isBrushing: boolean;
  highlightedGeometries: IndexedGeometry[];
  chartTransform: Transform;
  chartDimensions: Dimensions;
  chartRotation: Rotation;
  style: HighlighterStyle;
}

function getTransformForPanel(panel: Dimensions, rotation: Rotation, { left, top }: Pick<Dimensions, 'top' | 'left'>) {
  const { x, y } = computeChartTransform(panel, rotation);
  return `translate(${left + panel.left + x}, ${top + panel.top + y}) rotate(${rotation})`;
}

function renderPath(geom: PointGeometry, radius: number) {
  // keep the highlighter radius to a minimum
  const [shapeFn, rotate] = ShapeRendererFn[geom.style.shape];
  return {
    d: shapeFn(radius),
    rotate,
  };
}

class HighlighterComponent extends React.Component<HighlighterProps> {
  static displayName = 'Highlighter';

  render() {
    const { chartDimensions, chartRotation, chartId, zIndex, isBrushing, style } = this.props;
    if (isBrushing) return null;
    const clipWidth = [90, -90].includes(chartRotation) ? chartDimensions.height : chartDimensions.width;
    const clipHeight = [90, -90].includes(chartRotation) ? chartDimensions.width : chartDimensions.height;
    const clipPathId = `echHighlighterClipPath__${chartId}`;

    const seenBarSeries = new Set<string>();
    const highlightedGeometries = this.props.highlightedGeometries.filter((geom) => {
      if (!isBarGeometry(geom)) return true;
      const seen = seenBarSeries.has(geom.seriesIdentifier.key);
      seenBarSeries.add(geom.seriesIdentifier.key);
      return !seen;
    });

    return (
      <svg className="echHighlighter" style={{ zIndex }}>
        <defs>
          <clipPath id={clipPathId}>
            <rect x="0" y="0" width={clipWidth} height={clipHeight} />
          </clipPath>
        </defs>

        {highlightedGeometries.map((geom, i) => {
          const { panel } = geom;
          const x = geom.x + geom.transform.x;
          const y = geom.y + geom.transform.y;
          const geomTransform = getTransformForPanel(panel, chartRotation, chartDimensions);

          if (isPointGeometry(geom)) {
            // bucket highlighted points
            const bucketHighlightedFillColor = getColorFromVariant(
              RGBATupleToString(geom.style.stroke.color),
              style.point.bucketHighlighted?.fill,
            );
            const bucketHighlightedStrokeColor = getColorFromVariant(
              RGBATupleToString(geom.style.stroke.color),
              style.point.bucketHighlighted?.stroke,
            );
            const bucketHighlightedRadius = Math.max(geom.radius, style.point.bucketHighlighted?.radius || 0);
            const { d: bucketHighlightedD, rotate: bucketHighlightedRotate } = renderPath(
              geom,
              bucketHighlightedRadius,
            );
            // hovered highlighted points
            const fillColor = getColorFromVariant(RGBATupleToString(geom.style.stroke.color), style.point.fill);
            const strokeColor = getColorFromVariant(RGBATupleToString(geom.style.stroke.color), style.point.stroke);

            const radius = Math.max(geom.radius, style.point.radius);
            const { d, rotate } = renderPath(geom, radius);
            return (
              <>
                {geom.bucketHighlighted && (
                  <g
                    key={i}
                    transform={geomTransform}
                    clipPath={geom.value.mark !== null ? `url(#${clipPathId})` : undefined}
                  >
                    <path
                      d={bucketHighlightedD}
                      transform={`translate(${x}, ${y}) rotate(${bucketHighlightedRotate || 0})`}
                      fill={bucketHighlightedFillColor}
                      stroke={bucketHighlightedStrokeColor}
                      strokeWidth={style.point.bucketHighlighted?.strokeWidth}
                      opacity={style.point.bucketHighlighted?.opacity}
                    />
                  </g>
                )}
                {geom.hovered && (
                  <g
                    key={i}
                    transform={geomTransform}
                    clipPath={geom.value.mark !== null ? `url(#${clipPathId})` : undefined}
                  >
                    <path
                      d={d}
                      transform={`translate(${x}, ${y}) rotate(${rotate || 0})`}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={style.point.strokeWidth}
                      opacity={style.point.opacity}
                    />
                  </g>
                )}
              </>
            );
          }

          return (
            <rect
              key={i}
              x={x}
              y={geom.y}
              width={geom.width}
              height={geom.height}
              transform={geomTransform}
              className="echHighlighterOverlay__fill"
              clipPath={`url(#${clipPathId})`}
            />
          );
        })}
      </svg>
    );
  }
}

const mapStateToProps = (state: GlobalChartState): HighlighterProps => {
  const { chartId, zIndex } = state;
  if (getInternalIsInitializedSelector(state) !== InitStatus.Initialized) {
    return {
      initialized: false,
      chartId,
      zIndex,
      isBrushing: false,
      highlightedGeometries: [],
      chartTransform: {
        x: 0,
        y: 0,
        rotate: 0,
      },
      chartDimensions: { top: 0, left: 0, width: 0, height: 0 },
      chartRotation: 0,
      style: LIGHT_THEME.highlighter,
    };
  }

  return {
    initialized: true,
    chartId,
    zIndex,
    isBrushing: isBrushingSelector(state),
    highlightedGeometries: getHighlightedGeomsSelector(state),
    chartTransform: computeChartTransformSelector(state),
    chartDimensions: computeChartDimensionsSelector(state).chartDimensions,
    chartRotation: getChartRotationSelector(state),
    style: getChartThemeSelector(state).highlighter,
  };
};

/** @internal */
export const Highlighter = connect(mapStateToProps)(HighlighterComponent);

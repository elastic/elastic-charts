/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License. */

import React from 'react';
import { connect } from 'react-redux';
import { GlobalChartState } from '../../../../state/chart_state';
import { isInitialized } from '../../../../state/selectors/is_initialized';
import { QuadViewModel } from '../../layout/types/viewmodel_types';
import { TAU } from '../../layout/utils/math';
import { partitionGeometries } from '../../state/selectors/geometries';
import { PointObject } from '../../layout/types/geometry_types';
import { getHighlightedSectorsSelector } from '../../state/selectors/get_highlighted_shapes';
import { getPickedShapes } from '../../state/selectors/picked_shapes';
import { PartitionLayout } from '../../layout/types/config_types';

interface HighlighterProps {
  chartId: string;
  initialized: boolean;
  partitionLayout: PartitionLayout;
  geometries: QuadViewModel[];
  diskCenter: PointObject;
  outerRadius: number;
  renderAsOverlay: boolean;
}

const EPSILON = 1e-6;

/**
 * This function return an SVG arc path from the same parameters of the canvas.arc function call
 * @param x The horizontal coordinate of the arc's center
 * @param y The vertical coordinate of the arc's center
 * @param r The arc's radius. Must be positive
 * @param a0 The angle at which the arc starts in radians, measured from the positive x-axis
 * @param a1 The angle at which the arc ends in radians, measured from the positive x-axis
 * @param ccw If 1, draws the arc counter-clockwise between the start and end angles
 */
function getSectorShapeFromCanvasArc(x: number, y: number, r: number, a0: number, a1: number, ccw: number): string {
  const cw = 1 ^ ccw;
  const da = ccw ? a0 - a1 : a1 - a0;
  return `A${r},${r},0,${+(da >= Math.PI)},${cw},${x + r * Math.cos(a1)},${y + r * Math.sin(a1)}`;
}

/**
 * Renders an SVG Rect from a partition chart QuadViewModel
 * @param geometry the QuadViewModel
 * @param key the key to apply to the react element
 * @param fillColor the optional fill color
 */
function renderRectangles(geometry: QuadViewModel, key: string, fillColor = 'black') {
  const { x0, x1, y0px, y1px } = geometry;
  return <rect key={key} x={x0} y={y0px} width={Math.abs(x1 - x0)} height={Math.abs(y1px - y0px)} fill={fillColor} />;
}

/**
 * Render an SVG path or circle from a partition chart QuadViewModel
 * @param geometry the QuadViewModel
 * @param key the key to apply to the react element
 * @param fillColor the optional fill color
 */
function renderSector(geometry: QuadViewModel, key: string, fillColor = 'black') {
  const { x0, x1, y0px, y1px } = geometry;
  if ((Math.abs(x0 - x1) + TAU) % TAU < EPSILON) {
    return <circle key={key} r={(y0px + y1px) / 2} fill="none" stroke="black" strokeWidth={y1px - y0px} />;
  }
  const X0 = x0 - TAU / 4;
  const X1 = x1 - TAU / 4;
  const path = [
    `M${y0px * Math.cos(X0)},${y0px * Math.sin(X0)}`,
    getSectorShapeFromCanvasArc(0, 0, y0px, X0, X1, 0),
    `L${y1px * Math.cos(X1)},${y1px * Math.sin(X1)}`,
    getSectorShapeFromCanvasArc(0, 0, y1px, X1, X0, 1),
    'Z',
  ].join(' ');
  return <path key={key} d={path} fill={fillColor} />;
}

function renderGeometries(geometries: QuadViewModel[], partitionLayout: PartitionLayout, fillColor = 'black') {
  let maxDepth = -1;
  // we should render only the deepest geometries of the tree to avoid overlaying highlighted geometries
  if (partitionLayout === PartitionLayout.treemap) {
    maxDepth = geometries.reduce((acc, geom) => {
      return Math.max(acc, geom.depth);
    }, 0);
  }
  return geometries
    .filter((geometry) => {
      if (maxDepth !== -1) {
        return geometry.depth >= maxDepth;
      }
      return true;
    })
    .map((geometry, index) => {
      if (partitionLayout === PartitionLayout.sunburst) {
        return renderSector(geometry, `${index}`, fillColor);
      }

      return renderRectangles(geometry, `${index}`, fillColor);
    });
}

class HighlighterComponent extends React.Component<HighlighterProps> {
  static displayName = 'Highlighter';

  renderAsMask() {
    const { geometries, diskCenter, outerRadius, partitionLayout, chartId } = this.props;
    const maskId = `echHighlighterMask__${chartId}`;
    return (
      <>
        <defs>
          <mask id="echHighlighterMask">
            <rect x={0} y={0} width="1500" height="1500" fill="white" />
            <g transform={`translate(${diskCenter.x}, ${diskCenter.y})`}>
              {renderGeometries(geometries, partitionLayout)}
            </g>
          </mask>
        </defs>

        <circle
          cx={diskCenter.x}
          cy={diskCenter.y}
          r={outerRadius}
          mask={`url(#${maskId})`}
          opacity="0.75"
          fill="white"
        />
      </>
    );
  }

  renderAsOverlay() {
    const { geometries, diskCenter, partitionLayout } = this.props;
    return (
      <g transform={`translate(${diskCenter.x}, ${diskCenter.y})`}>
        {renderGeometries(geometries, partitionLayout, 'rgba(255, 255, 255, 0.35')}
      </g>
    );
  }

  render() {
    const { renderAsOverlay } = this.props;

    return (
      <svg className="echHighlighter" width="100%" height="100%">
        {renderAsOverlay ? this.renderAsOverlay() : this.renderAsMask()}
      </svg>
    );
  }
}

const DEFAULT_PROPS: HighlighterProps = {
  chartId: 'empty',
  initialized: false,
  geometries: [],
  diskCenter: {
    x: 0,
    y: 0,
  },
  outerRadius: 10,
  renderAsOverlay: false,
  partitionLayout: PartitionLayout.sunburst,
};

const legendMapStateToProps = (state: GlobalChartState): HighlighterProps => {
  if (!isInitialized(state)) {
    return DEFAULT_PROPS;
  }

  const { chartId } = state;
  const {
    outerRadius,
    diskCenter,
    config: { partitionLayout },
  } = partitionGeometries(state);

  const geometries = getHighlightedSectorsSelector(state);
  return {
    chartId,
    initialized: true,
    renderAsOverlay: false,
    geometries,
    diskCenter,
    outerRadius,
    partitionLayout,
  };
};

const hoverMapStateToProps = (state: GlobalChartState): HighlighterProps => {
  if (!isInitialized(state)) {
    return DEFAULT_PROPS;
  }

  const { chartId } = state;
  const {
    outerRadius,
    diskCenter,
    config: { partitionLayout },
  } = partitionGeometries(state);

  const geometries = getPickedShapes(state);
  return {
    chartId,
    initialized: true,
    renderAsOverlay: true,
    diskCenter,
    outerRadius,
    geometries,
    partitionLayout,
  };
};

/**
 * Partition chart highlighter from legend events
 * @internal
 */
export const HighlighterFromLegend = connect(legendMapStateToProps)(HighlighterComponent);

/**
 * Partition chart highlighter from mouse hover events
 * @internal
 */
export const HighlighterFromHover = connect(hoverMapStateToProps)(HighlighterComponent);

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
 * under the License.
 */

import React from 'react';

import { TAU } from '../../../../common/constants';
import { PointObject } from '../../../../common/geometry';
import { Dimensions } from '../../../../utils/dimensions';
import { configMetadata } from '../../layout/config';
import { PartitionLayout } from '../../layout/types/config_types';
import { QuadViewModel } from '../../layout/types/viewmodel_types';
import { isSunburst, isTreemap } from '../../layout/viewmodel/viewmodel';
import { ContinuousDomainFocus } from '../canvas/partition';

/** @internal */
export interface HighlighterProps {
  chartId: string;
  initialized: boolean;
  canvasDimension: Dimensions;
  partitionLayout: PartitionLayout;
  geometries: QuadViewModel[];
  geometriesFocus: ContinuousDomainFocus;
  diskCenter: PointObject;
  outerRadius: number;
  renderAsOverlay: boolean;
}

const EPSILON = 1e-6;

interface SVGStyle {
  color?: string;
  fillClassName?: string;
  strokeClassName?: string;
}

/**
 * This function return an SVG arc path from the same parameters of the canvas.arc function call
 * @param x The horizontal coordinate of the arc's center
 * @param y The vertical coordinate of the arc's center
 * @param r The arc's radius. Must be positive
 * @param a0 The angle at which the arc starts in radians, measured from the positive x-axis
 * @param a1 The angle at which the arc ends in radians, measured from the positive x-axis
 * @param ccw If 1, draws the arc counter-clockwise between the start and end angles
 */
function getSectorShapeFromCanvasArc(x: number, y: number, r: number, a0: number, a1: number, ccw: boolean): string {
  const cw = Number(!ccw);
  const da = ccw ? a0 - a1 : a1 - a0;
  return `A${r},${r},0,${+(da >= Math.PI)},${cw},${x + r * Math.cos(a1)},${y + r * Math.sin(a1)}`;
}

/**
 * Renders an SVG Rect from a partition chart QuadViewModel
 */
function renderRectangles(
  geometry: QuadViewModel,
  key: string,
  style: SVGStyle,
  { currentFocusX0, currentFocusX1 }: ContinuousDomainFocus,
  width: number,
) {
  const { x0, x1, y0px, y1px } = geometry;
  const props = style.color ? { fill: style.color } : { className: style.fillClassName };
  const scale = width / (currentFocusX1 - currentFocusX0);
  const fx0 = Math.max((x0 - currentFocusX0) * scale, 0);
  const fx1 = Math.min((x1 - currentFocusX0) * scale, width);
  return <rect key={key} x={fx0} y={y0px} width={Math.abs(fx1 - fx0)} height={Math.abs(y1px - y0px)} {...props} />;
}

/**
 * Render an SVG path or circle from a partition chart QuadViewModel
 */
function renderSector(geometry: QuadViewModel, key: string, style: SVGStyle) {
  const { x0, x1, y0px, y1px } = geometry;
  if ((Math.abs(x0 - x1) + TAU) % TAU < EPSILON) {
    const props = style.color ? { stroke: style.color } : { className: style.strokeClassName };
    return <circle key={key} r={(y0px + y1px) / 2} {...props} fill="none" strokeWidth={y1px - y0px} />;
  }
  const X0 = x0 - TAU / 4;
  const X1 = x1 - TAU / 4;
  const path = [
    `M${y0px * Math.cos(X0)},${y0px * Math.sin(X0)}`,
    getSectorShapeFromCanvasArc(0, 0, y0px, X0, X1, false),
    `L${y1px * Math.cos(X1)},${y1px * Math.sin(X1)}`,
    getSectorShapeFromCanvasArc(0, 0, y1px, X1, X0, true),
    'Z',
  ].join(' ');
  const props = style.color ? { fill: style.color } : { className: style.fillClassName };
  return <path key={key} d={path} {...props} />;
}

function renderGeometries(
  geoms: QuadViewModel[],
  partitionLayout: PartitionLayout,
  style: SVGStyle,
  focus: ContinuousDomainFocus,
  width: number,
) {
  const maxDepth = geoms.reduce((acc, geom) => Math.max(acc, geom.depth), 0);
  // we should render only the deepest geometries of the tree to avoid overlaying highlighted geometries
  const highlightedGeoms = isTreemap(partitionLayout) ? geoms.filter((g) => g.depth >= maxDepth) : geoms;
  const renderGeom = isSunburst(partitionLayout) ? renderSector : renderRectangles;
  return highlightedGeoms.map((geometry, index) => renderGeom(geometry, `${index}`, style, focus, width));
}

/** @internal */
export class HighlighterComponent extends React.Component<HighlighterProps> {
  static displayName = 'Highlighter';

  renderAsMask() {
    const {
      geometries,
      geometriesFocus,
      diskCenter,
      outerRadius,
      partitionLayout,
      chartId,
      canvasDimension: { width, height },
    } = this.props;
    const maskId = `echHighlighterMask__${chartId}`;
    return (
      <>
        <defs>
          <mask id={maskId}>
            <rect x={0} y={0} width={width} height={height} fill="white" />
            <g transform={`translate(${diskCenter.x}, ${diskCenter.y})`}>
              {renderGeometries(geometries, partitionLayout, { color: 'black' }, geometriesFocus, width)}
            </g>
          </mask>
        </defs>
        {isSunburst(partitionLayout) ? (
          <circle
            cx={diskCenter.x}
            cy={diskCenter.y}
            r={outerRadius}
            mask={`url(#${maskId})`}
            className="echHighlighter__mask"
          />
        ) : (
          <rect x={0} y={0} width={width} height={height} mask={`url(#${maskId})`} className="echHighlighter__mask" />
        )}
      </>
    );
  }

  renderAsOverlay() {
    const {
      geometries,
      geometriesFocus,
      diskCenter,
      partitionLayout,
      canvasDimension: { width },
    } = this.props;
    return (
      <g transform={`translate(${diskCenter.x}, ${diskCenter.y})`}>
        {renderGeometries(
          geometries,
          partitionLayout,
          {
            fillClassName: 'echHighlighterOverlay__fill',
            strokeClassName: 'echHighlighterOverlay__stroke',
          },
          geometriesFocus,
          width,
        )}
      </g>
    );
  }

  render() {
    const { geometries, renderAsOverlay } = this.props;
    if (geometries.length === 0) {
      return null;
    }
    return (
      <svg className="echHighlighter" width="100%" height="100%">
        {renderAsOverlay ? this.renderAsOverlay() : this.renderAsMask()}
      </svg>
    );
  }
}

/** @internal */
export const DEFAULT_PROPS: HighlighterProps = {
  chartId: 'empty',
  initialized: false,
  canvasDimension: {
    width: 0,
    height: 0,
    left: 0,
    top: 0,
  },
  geometries: [],
  geometriesFocus: { currentFocusX0: NaN, currentFocusX1: NaN, prevFocusX0: NaN, prevFocusX1: NaN },
  diskCenter: {
    x: 0,
    y: 0,
  },
  outerRadius: 10,
  renderAsOverlay: false,
  partitionLayout: configMetadata.partitionLayout.dflt,
};

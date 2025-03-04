/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { Colors } from '../../../../common/colors';
import { TAU } from '../../../../common/constants';
import type { PointObject } from '../../../../common/geometry';
import type { Dimensions } from '../../../../utils/dimensions';
import type { PartitionLayout } from '../../layout/types/config_types';
import type { PartitionSmallMultiplesModel, QuadViewModel, ShapeViewModel } from '../../layout/types/viewmodel_types';
import { nullPartitionSmallMultiplesModel } from '../../layout/types/viewmodel_types';
import { isSunburst, isTreemap, isMosaic } from '../../layout/viewmodel/viewmodel';
import type { ContinuousDomainFocus, IndexedContinuousDomainFocus } from '../canvas/partition';

interface HighlightSet extends PartitionSmallMultiplesModel {
  geometries: QuadViewModel[];
  geometriesFoci: ContinuousDomainFocus[];
  diskCenter: PointObject;
  outerRadius: number;
  layout: PartitionLayout;
}

/** @internal */
export interface HighlighterProps {
  chartId: string;
  initialized: boolean;
  canvasDimension: Dimensions;
  renderAsOverlay: boolean;
  highlightSets: HighlightSet[];
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
 * @param ccw If true, draws the arc counter-clockwise between the start and end angles
 */
function getSectorShapeFromCanvasArc(x: number, y: number, r: number, a0: number, a1: number, ccw: boolean): string {
  const cw = ccw ? 0 : 1;
  const diff = a1 - a0;
  const direction = ccw ? -1 : 1;
  return `A${r},${r},0,${+(direction * diff >= Math.PI)},${cw},${x + r * Math.cos(a1)},${y + r * Math.sin(a1)}`;
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
function renderSector(geometry: QuadViewModel, key: string, { color, fillClassName, strokeClassName }: SVGStyle) {
  const { x0, x1, y0px, y1px } = geometry;
  if ((Math.abs(x0 - x1) + TAU) % TAU < EPSILON) {
    const props =
      y0px === 0
        ? {
            key,
            r: y1px,
            stroke: 'none',
            ...(color ? { fill: color } : { className: fillClassName }),
          }
        : {
            key,
            r: (y0px + y1px) / 2,
            strokeWidth: y1px - y0px,
            fill: 'none',
            ...(color ? { stroke: color } : { className: strokeClassName }),
          };
    return <circle {...props} />;
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
  const props = color ? { fill: color } : { className: fillClassName };
  return <path key={key} d={path} {...props} />;
}

function renderGeometries(
  geoms: QuadViewModel[],
  partitionLayout: PartitionLayout,
  style: SVGStyle,
  foci: ContinuousDomainFocus[],
  width: number,
) {
  const maxDepth = geoms.reduce((acc, geom) => Math.max(acc, geom.depth), 0);
  // we should render only the deepest geometries of the tree to avoid overlaying highlighted geometries
  const highlightedGeoms =
    isTreemap(partitionLayout) || isMosaic(partitionLayout) ? geoms.filter((g) => g.depth >= maxDepth) : geoms;
  const renderGeom = isSunburst(partitionLayout) ? renderSector : renderRectangles;
  return highlightedGeoms.map((geometry, index) =>
    renderGeom(
      geometry,
      `${index}`,
      style,
      foci[0] ?? {
        currentFocusX0: NaN,
        currentFocusX1: NaN,
        prevFocusX0: NaN,
        prevFocusX1: NaN,
      },
      width,
    ),
  );
}

/** @internal */
export class HighlighterComponent extends React.Component<HighlighterProps> {
  static displayName = 'Highlighter';

  renderAsMask() {
    const {
      chartId,
      canvasDimension: { width },
      highlightSets,
    } = this.props;

    const maskId = (ind: number, ind2: number) => `echHighlighterMask__${chartId}__${ind}__${ind2}`;

    const someGeometriesHighlighted = highlightSets.some(({ geometries }) => geometries.length > 0);
    const renderedHighlightSet = someGeometriesHighlighted ? highlightSets : [];

    return (
      <>
        <defs>
          {renderedHighlightSet
            .filter(({ geometries, outerRadius }) => geometries.length > 0 && outerRadius > 0)
            .map(
              ({
                geometries,
                geometriesFoci,
                diskCenter,
                index,
                innerIndex,
                layout,
                marginLeftPx,
                marginTopPx,
                panel: { innerWidth, innerHeight },
              }) => (
                <mask key={maskId(index, innerIndex)} id={maskId(index, innerIndex)}>
                  <rect x={marginLeftPx} y={marginTopPx} width={innerWidth} height={innerHeight} fill="white" />
                  <g transform={`translate(${diskCenter.x}, ${diskCenter.y})`}>
                    {renderGeometries(geometries, layout, { color: Colors.Black.keyword }, geometriesFoci, width)}
                  </g>
                </mask>
              ),
            )}
        </defs>
        {renderedHighlightSet
          .filter(({ outerRadius }) => outerRadius > 0)
          .map(
            ({
              diskCenter,
              outerRadius,
              index,
              innerIndex,
              layout,
              marginLeftPx,
              marginTopPx,
              panel: { innerWidth, innerHeight },
            }) =>
              isSunburst(layout) ? (
                <circle
                  key={`${index}__${innerIndex}`}
                  cx={diskCenter.x}
                  cy={diskCenter.y}
                  r={outerRadius}
                  mask={`url(#${maskId(index, innerIndex)})`}
                  className="echHighlighter__mask"
                />
              ) : (
                <rect
                  key={`${index}__${innerIndex}`}
                  x={marginLeftPx}
                  y={marginTopPx}
                  width={innerWidth}
                  height={innerHeight}
                  mask={`url(#${maskId(index, innerIndex)})`}
                  className="echHighlighter__mask"
                />
              ),
          )}
      </>
    );
  }

  renderAsOverlay() {
    const {
      canvasDimension: { width },
    } = this.props;
    return this.props.highlightSets
      .filter(({ geometries, outerRadius }) => geometries.length > 0 && outerRadius > 0)
      .map(({ index, innerIndex, layout, geometries, diskCenter, geometriesFoci }) => (
        <g key={`${index}|${innerIndex}`} transform={`translate(${diskCenter.x}, ${diskCenter.y})`}>
          {renderGeometries(
            geometries,
            layout,
            {
              fillClassName: 'echHighlighterOverlay__fill',
              strokeClassName: 'echHighlighterOverlay__stroke',
            },
            geometriesFoci,
            width,
          )}
        </g>
      ));
  }

  render() {
    return (
      <svg className="echHighlighter" width="100%" height="100%">
        {this.props.renderAsOverlay ? this.renderAsOverlay() : this.renderAsMask()}
      </svg>
    );
  }
}

/** @internal */
export const DEFAULT_PROPS: HighlighterProps = {
  chartId: 'empty',
  initialized: false,
  renderAsOverlay: false,
  canvasDimension: {
    width: 0,
    height: 0,
    left: 0,
    top: 0,
  },
  highlightSets: [
    {
      ...nullPartitionSmallMultiplesModel(),
      geometries: [],
      geometriesFoci: [],
      diskCenter: {
        x: 0,
        y: 0,
      },
      outerRadius: 10,
    },
  ],
};

/** @internal */
export function highlightSetMapper(geometries: QuadViewModel[], foci: IndexedContinuousDomainFocus[]) {
  return (vm: ShapeViewModel): HighlightSet => {
    const { index, innerIndex } = vm;
    return {
      ...vm,
      geometries: geometries.filter(({ index: i, innerIndex: ii }) => index === i && innerIndex === ii),
      geometriesFoci: foci.filter(({ index: i, innerIndex: ii }) => index === i && innerIndex === ii),
    };
  };
}

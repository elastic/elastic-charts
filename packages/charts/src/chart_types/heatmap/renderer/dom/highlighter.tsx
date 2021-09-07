/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { FC } from 'react';

import { PointerStates } from '../../../../state/chart_state';
import { Dimensions } from '../../../../utils/dimensions';
import { config } from '../../layout/config/config';
import { Config } from '../../layout/types/config_types';
import { DragShape, nullShapeViewModel, ShapeViewModel } from '../../layout/types/viewmodel_types';

/** @internal */
export interface HighlighterCellsProps {
  chartId: string;
  initialized: boolean;
  canvasDimension: Dimensions;
  geometries: ShapeViewModel;
  dragShape: DragShape | null;
  brushMask: Config['brushMask'];
  brushArea: Config['brushArea'];
  pointer: PointerStates | null;
}

/**
 * @internal
 *
 * Component for highlighting selected cells
 */
export const HighlighterCellsComponent: FC<HighlighterCellsProps> = ({
  initialized,
  dragShape,
  chartId,
  canvasDimension,
  brushArea,
  brushMask,
  pointer,
}) => {
  if (!initialized || dragShape === null) return null;

  const maskId = `echHighlighterMask__${chartId}`;
  const pointerOnLeftAxis =
    pointer && pointer.lastDrag ? pointer.lastDrag?.start.position.x < canvasDimension.left : false;
  return !pointerOnLeftAxis ? (
    <svg className="echHighlighter" width="100%" height="100%">
      <defs>
        <mask id={maskId}>
          {/* the entire chart */}
          {brushMask.visible && (
            <rect
              x={0}
              y={0}
              width={canvasDimension.width + canvasDimension.left}
              height={canvasDimension.height}
              fill="#eee"
            />
          )}
          {brushArea.visible && (
            <>
              {/* the rectangle box */}
              <rect
                x={dragShape.x}
                y={dragShape.y}
                width={dragShape.width}
                height={dragShape.height}
                fill={brushArea.fill}
              />
              {/* the left axis labels */}
              <rect
                x={0}
                y={dragShape.y}
                width={canvasDimension.left}
                height={dragShape.height}
                fill={brushArea.fill}
              />
            </>
          )}
        </mask>
      </defs>
      <g>
        {/* the entire chart */}
        {brushMask.visible && (
          <rect
            x={0}
            y={0}
            width={canvasDimension.width + canvasDimension.left}
            height={canvasDimension.height}
            mask={`url(#${maskId})`}
            fill={brushMask.fill}
          />
        )}
        {brushArea.visible && (
          <>
            {/* top line for the box */}
            <line
              x1={dragShape.x}
              y1={dragShape.y}
              x2={dragShape.x + dragShape.width}
              y2={dragShape.y}
              stroke={brushArea.stroke}
              strokeWidth={brushArea.strokeWidth}
            />
            {/* bottom line */}
            <line
              x1={dragShape.x}
              y1={dragShape.y + dragShape.height}
              x2={dragShape.x + dragShape.width}
              y2={dragShape.y + dragShape.height}
              stroke={brushArea.stroke}
              strokeWidth={brushArea.strokeWidth}
            />
            {/* left line */}
            <line
              x1={dragShape.x}
              y1={dragShape.y}
              x2={dragShape.x}
              y2={dragShape.y + dragShape.height}
              stroke={brushArea.stroke}
              strokeWidth={brushArea.strokeWidth}
            />
            {/* right line */}
            <line
              x1={dragShape.x + dragShape.width}
              y1={dragShape.y}
              x2={dragShape.x + dragShape.width}
              y2={dragShape.y + dragShape.height}
              stroke={brushArea.stroke}
              strokeWidth={brushArea.strokeWidth}
            />
          </>
        )}
      </g>
    </svg>
  ) : null;
};

/** @internal */
export const DEFAULT_PROPS: HighlighterCellsProps = {
  chartId: 'empty',
  initialized: false,
  canvasDimension: {
    width: 0,
    height: 0,
    left: 0,
    top: 0,
  },
  geometries: nullShapeViewModel(),
  dragShape: { x: 0, y: 0, height: 0, width: 0 },
  brushArea: config.brushArea,
  brushMask: config.brushMask,
  pointer: null,
};

/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { FC } from 'react';

import { Rect } from '../../../../geoms/types';
import { Dimensions } from '../../../../utils/dimensions';
import { LIGHT_THEME } from '../../../../utils/themes/light_theme';
import { HeatmapStyle } from '../../../../utils/themes/theme';
import { DragShape, nullShapeViewModel, ShapeViewModel } from '../../layout/types/viewmodel_types';

/** @internal */
export interface HighlighterCellsProps {
  chartId: string;
  initialized: boolean;
  canvasDimension: Dimensions;
  geometries: ShapeViewModel;
  dragShape: DragShape | null;
  brushMaskRect: Rect;
  brushMaskStyle: HeatmapStyle['brushMask'];
  brushArea: HeatmapStyle['brushArea'];
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
  brushMaskRect,
  brushMaskStyle,
  brushArea,
}) => {
  if (!initialized || dragShape === null) return null;

  return (
    <svg className="echHighlighter" width="100%" height="100%">
      <defs>
        <mask id={`echHighlighterMask__${chartId}`}>
          {/* the entire chart */}
          {brushMaskStyle.visible && (
            <rect
              x={brushMaskRect.x}
              y={brushMaskRect.y}
              width={brushMaskRect.width}
              height={brushMaskRect.height}
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
        {brushMaskStyle.visible && (
          <rect
            x={brushMaskRect.x}
            y={brushMaskRect.y}
            width={brushMaskRect.width}
            height={brushMaskRect.height}
            mask={`url(#echHighlighterMask__${chartId})`}
            fill={brushMaskStyle.fill}
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
  );
};

/** @internal */
export const DEFAULT_PROPS: HighlighterCellsProps = {
  chartId: 'empty',
  initialized: false,
  canvasDimension: { width: 0, height: 0, left: 0, top: 0 },
  geometries: nullShapeViewModel(),
  dragShape: { x: 0, y: 0, height: 0, width: 0 },
  brushMaskRect: { x: 0, y: 0, width: 0, height: 0 },
  brushMaskStyle: LIGHT_THEME.heatmap.brushMask,
  brushArea: LIGHT_THEME.heatmap.brushArea,
};

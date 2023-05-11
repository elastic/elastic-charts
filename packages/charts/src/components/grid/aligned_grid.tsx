/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { grid } from 'charts-storybook/stories/metric/metric.stories';
import React, { ComponentType, CSSProperties, FC, PropsWithChildren } from 'react';

import { Size } from '../../utils/dimensions';

interface AlignedGridProps<D> {
  data: Array<Array<D | undefined>>;
  headerComponent: ComponentType<{
    datum: D;
    stats: { rows: number; rowIndex: number; columns: number; columnIndex: number };
  }>;
  contentComponent: ComponentType<{
    datum: D;
    stats: { rows: number; rowIndex: number; columns: number; columnIndex: number };
  }>;
}

/** @internal */
export function AlignedGrid<D>({
  data,
  headerComponent: HeaderComponent,
  contentComponent: ContentComponent,
}: AlignedGridProps<D>) {
  const rows = data.length;
  const columns = data.reduce((acc, row) => {
    return Math.max(acc, row.length);
  }, 0);
  console.log({ columnCount: columns, rowCount: rows });

  const gridStyle: CSSProperties = {
    gridTemplateColumns: `repeat(${columns}, 1fr`,
    gridTemplateRows: `repeat(${rows}, max-content 1fr)`,
  };

  return (
    <div className="echAlignedGrid" style={gridStyle}>
      {data.map((row, rowIndex) =>
        row.map((cell, columnIndex) => {
          const headerStyle: CSSProperties = {
            gridRow: rowIndex * 2 + 1,
            gridColumn: columnIndex + 1,
          };
          const contentStyle: CSSProperties = {
            gridRow: rowIndex * 2 + 2,
            gridColumn: columnIndex + 1,
          };
          if (!cell) {
            return (
              <>
                <div className="echAlignedGrid--header" style={headerStyle}></div>
                <div className="echAlignedGrid--content" style={contentStyle}></div>
              </>
            );
          }
          return (
            <>
              <div className="echAlignedGrid--header" style={headerStyle}>
                <HeaderComponent datum={cell} stats={{ rowIndex, columnIndex, columns, rows }} />
              </div>
              <div className="echAlignedGrid--content" style={contentStyle}>
                <ContentComponent datum={cell} stats={{ rowIndex, columnIndex, columns, rows }} />
              </div>
            </>
          );
        }),
      )}
    </div>
  );
}

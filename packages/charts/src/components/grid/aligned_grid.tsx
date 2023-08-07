/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import React, { ComponentType, CSSProperties } from 'react';

interface AlignedGridProps<D> {
  data: Array<Array<D | undefined>>;
  contentComponent: ComponentType<{
    datum: D;
    stats: { rows: number; rowIndex: number; columns: number; columnIndex: number };
  }>;
}

/** @internal */
export function AlignedGrid<D>({ data, contentComponent: ContentComponent }: AlignedGridProps<D>) {
  const rows = data.length;
  const columns = data.reduce((acc, row) => {
    return Math.max(acc, row.length);
  }, 0);

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
          const headerClassName = classNames('echAlignedGrid--header', {
            echAlignedGrid__borderRight: columnIndex < columns - 1,
            // echAlignedGrid__borderBottom: true,
          });
          const contentClassName = classNames('echAlignedGrid--content', {
            echAlignedGrid__borderRight: columnIndex < columns - 1,
            echAlignedGrid__borderBottom: rowIndex < rows - 1,
          });
          if (!cell) {
            return (
              <>
                <div className={headerClassName} style={headerStyle}></div>
                <div className={contentClassName} style={contentStyle}></div>
              </>
            );
          }

          return (
            <div key={`${rowIndex}-${columnIndex}`} className={contentClassName} style={contentStyle}>
              <ContentComponent datum={cell} stats={{ rowIndex, columnIndex, columns, rows }} />
            </div>
          );
        }),
      )}
    </div>
  );
}

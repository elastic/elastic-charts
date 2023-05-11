/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import React, { memo, ComponentType, forwardRef } from 'react';

import { highContrastColor } from '../../common/color_calcs';
import { colorToRgba } from '../../common/color_library_wrappers';
import { Color, Colors } from '../../common/colors';
import { Pixels } from '../../common/geometry';
import { A11ySettings } from '../../state/selectors/get_accessibility_config';
import { Size } from '../../utils/dimensions';

/** @internal */
export interface HTMLGridProps<D> {
  a11y: A11ySettings;
  size: Size;
  style: {
    minHeight: Pixels;
    border: Color;
    background: Color;
    text: {
      lightColor: Color;
      darkColor: Color;
    };
  };
  data: Array<Array<D>>;
  component: ComponentType<{
    rowCount: number;
    columnCount: number;
    datum: NonNullable<D>;
    rowIndex: number;
    columnIndex: number;
    panel: Size;
  }>;
  emptyComponent: ComponentType;
}

/** @internal */
export function HTMLGrid<D>({
  size,
  a11y,
  style,
  data,
  component: Component,
  emptyComponent: EmptyComponent,
}: HTMLGridProps<D>) {
  const rowCount = data.length;
  const columnCount = data.reduce((acc, row) => {
    return Math.max(acc, row.length);
  }, 0);
  const borderColor =
    highContrastColor(colorToRgba(style.background)) === Colors.White.rgba
      ? style.text.lightColor
      : style.text.darkColor;

  const panel = { width: size.width / columnCount, height: size.height / rowCount };
  return (
    // eslint-disable-next-line jsx-a11y/no-redundant-roles
    <ul
      role="list"
      className="echGridContainer"
      aria-labelledby={a11y.labelId}
      aria-describedby={a11y.descriptionId}
      style={{
        gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr)`,
        gridTemplateRows: `repeat(${rowCount}, minmax(${style.minHeight}px, 1fr)`,
      }}
    >
      {data.flatMap((columns, rowIndex) => {
        return [
          ...columns.map((datum, columnIndex) => {
            // fill undefined with empty panels
            const emptyMetricClassName = classNames('echGridCell', {
              'echGridCell--rightBorder': columnIndex < columnCount - 1,
              'echGridCell--bottomBorder': rowIndex < rowCount - 1,
            });
            const containerClassName = classNames('echGridCell', {
              'echGridCell--rightBorder': columnIndex < columnCount - 1,
              'echGridCell--bottomBorder': rowIndex < rowCount - 1,
            });

            return !datum ? (
              <li key={`${columnIndex}-${rowIndex}`} role="presentation">
                <div className={emptyMetricClassName} style={{ borderColor }}>
                  {/* <EmptyComponent /> */}
                </div>
              </li>
            ) : (
              <li key={`${columnIndex}-${rowIndex}`} className={containerClassName}>
                <Component
                  panel={panel}
                  key={`${columnIndex}-${rowIndex}`}
                  datum={datum}
                  rowCount={rowCount}
                  rowIndex={rowIndex}
                  columnCount={columnCount}
                  columnIndex={columnIndex}
                />
              </li>
            );
          }),
          // fill the grid row with empty panels
          ...Array.from({ length: columnCount - columns.length }, (_, zeroBasedColumnIndex) => {
            const columnIndex = zeroBasedColumnIndex + columns.length;
            const emptyMetricClassName = classNames('echGridCell', {
              'echGridCell--bottomBorder': rowIndex < rowCount - 1,
            });
            return (
              <li key={`missing-${columnIndex}-${rowIndex}`} role="presentation">
                <div className={emptyMetricClassName} style={{ borderColor }}>
                  {/* <EmptyComponent /> */}
                </div>
              </li>
            );
          }),
        ];
      })}
    </ul>
  );
}

/** @internal */
export const MemoizedGrid = memo(HTMLGrid);

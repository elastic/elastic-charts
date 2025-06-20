/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import React from 'react';

import type { ProgressBarSize } from './metric';
import type { MetricTextDimensions } from './text_measurements';
import { PADDING } from './text_measurements';
import { TitlesBlock } from './titles';
import type { Color } from '../../../../common/colors';
import { LayoutDirection, renderWithProps } from '../../../../utils/common';
import type { HorizontalSide, MetricStyle } from '../../../../utils/themes/theme';
import type { MetricDatum } from '../../specs';
import { isMetricWNumber } from '../../specs';

const getGridTemplateColumnsWithIcon = (iconAlign: HorizontalSide, iconSize: number) => {
  const iconSizeWithPadding = `${iconSize + PADDING}px`;
  return iconAlign === 'left' ? `${iconSizeWithPadding} minmax(0, 1fr)` : `minmax(0, 1fr)${iconSizeWithPadding}`;
};

interface TextColors {
  highContrastTextColor: Color;
}

interface MetricTextprops {
  id: string;
  datum: MetricDatum;
  style: MetricStyle;
  onElementClick?: () => void;
  progressBarSize: ProgressBarSize;
  textDimensions: MetricTextDimensions;
  textColors: TextColors;
}

/** @internal */
export const MetricText: React.FC<MetricTextprops> = ({
  id,
  datum,
  style,
  onElementClick,
  progressBarSize,
  textDimensions,
  textColors,
}) => {
  const { heightBasedSizes: sizes, hasProgressBar, progressBarDirection, visibility, textParts } = textDimensions;
  const { extra, body } = datum;

  const containerClassName = classNames('echMetricText', {
    [`echMetricText--${progressBarSize}`]: hasProgressBar,
    'echMetricText--vertical': progressBarDirection === LayoutDirection.Vertical,
    'echMetricText--horizontal': progressBarDirection === LayoutDirection.Horizontal,
  });

  const { valuePosition, iconAlign } = style;
  // TODO: Avoid checking isIconVisible too many times
  const isIconVisible = !!datum.icon;

  let valueRow, valueColumn, titlesRow, titlesColumn;
  if (valuePosition === 'top') {
    valueRow = 1;
    valueColumn = isIconVisible ? (iconAlign === 'left' ? 2 : '1') : '1';
    titlesRow = 2;
    titlesColumn = isIconVisible ? '1 / span 2' : '1';
  } else {
    valueRow = 4;
    valueColumn = isIconVisible ? '1 / span 2' : '1';
    titlesRow = 1;
    titlesColumn = isIconVisible ? (iconAlign === 'left' ? '2' : '1') : '1';
  }

  const gridColumn = isIconVisible ? '1 / span 2' : 1;

  const iconStyles = isIconVisible ? { gridRow: 1, gridColumn: iconAlign === 'left' ? 1 : 2 } : {};

  // If an icon is present, use a two-column grid (icon + content) by overriding the default gridTemplateColumns
  const gridTemplateColumns = isIconVisible ? getGridTemplateColumnsWithIcon(iconAlign, sizes.iconSize) : undefined;

  return (
    <div className={containerClassName} style={{ color: textColors.highContrastTextColor, gridTemplateColumns }}>
      {/* Titles Block */}
      <TitlesBlock
        metricId={id}
        title={datum.title}
        subtitle={datum.subtitle}
        sizes={sizes} // titleFontSize, subtitleFontSize
        visibility={visibility} // title, subtitle, titleLines, subtitleLines
        textAlign={style.titlesTextAlign}
        titleWeight={style.titleWeight}
        isIconVisible={isIconVisible}
        titlesRow={titlesRow}
        titlesColumn={titlesColumn}
        onElementClick={onElementClick}
      />

      {datum.icon && (
        <div
          className={classNames('echMetricText__icon', `echMetricText__icon--${style.iconAlign}`)}
          style={{ ...iconStyles }}
        >
          {renderWithProps(datum.icon, {
            width: sizes.iconSize,
            height: sizes.iconSize,
            color: textColors.highContrastTextColor,
          })}
        </div>
      )}

      <div className="echMetricText__gap" style={{ gridRow: valuePosition === 'top' ? 3 : 2, gridColumn }}>
        {body && <div className="echMetricText__body">{body}</div>}
      </div>

      {/* Extra Block */}
      <div
        className={classNames('echMetricText__extraBlock', `echMetricText__extraBlock--${style.extraTextAlign}`)}
        style={{ gridRow: valuePosition === 'top' ? 4 : 3, gridColumn }}
      >
        {visibility.extra && (
          <p className="echMetricText__extra" style={{ fontSize: sizes.extraFontSize }}>
            {renderWithProps(extra, { fontSize: sizes.extraFontSize, color: textColors.highContrastTextColor })}
          </p>
        )}
      </div>

      {/* Value Block */}
      <div
        className={classNames('echMetricText__valueBlock', `echMetricText__valueBlock--${style.valueTextAlign}`)}
        style={{ gridRow: valueRow, gridColumn: valueColumn }}
      >
        <p
          className="echMetricText__value"
          style={{
            fontSize: sizes.valueFontSize,
            textOverflow: isMetricWNumber(datum) ? undefined : 'ellipsis',
            color: datum.valueColor,
          }}
          title={textParts.map(({ text }) => text).join('')}
        >
          {textParts.map(({ emphasis, text }, i) => {
            return emphasis === 'small' ? (
              <span key={`${text}${i}`} className="echMetricText__part" style={{ fontSize: sizes.valuePartFontSize }}>
                {text}
              </span>
            ) : (
              text
            );
          })}
        </p>
        {datum.valueIcon && (
          <p
            className="echMetricText__valueIcon"
            style={{
              fontSize: sizes.valueFontSize,
              color: datum.valueColor ?? textColors.highContrastTextColor,
              marginRight: style.valueTextAlign === 'center' ? -(sizes.valuePartFontSize + PADDING) : undefined,
            }}
          >
            {renderWithProps(datum.valueIcon, {
              width: sizes.valuePartFontSize,
              height: sizes.valuePartFontSize,
              color: datum.valueColor ?? textColors.highContrastTextColor,
              verticalAlign: 'middle',
            })}
          </p>
        )}
      </div>
    </div>
  );
};

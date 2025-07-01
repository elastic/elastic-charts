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
import { SecondaryMetric } from './secondary_metric';
import type { MetricTextDimensions } from './text_measurements';
import { PADDING } from './text_measurements';
import { TitlesBlock } from './titles';
import type { Color } from '../../../../common/colors';
import { LayoutDirection, renderWithProps } from '../../../../utils/common';
import type { HorizontalSide, MetricStyle } from '../../../../utils/themes/theme';
import type { MetricDatum } from '../../specs';
import { isMetricWNumber, isSecondaryMetricProps } from '../../specs';

const gridRows = {
  top: { value: '1', titles: '2', body: '3', extra: '4' },
  bottom: { value: '4', titles: '1', body: '2', extra: '3' },
};

const gridColumnsValuePostitionTop = {
  left: { value: '2', titles: '1 / span 2', body: '1 / span 2', extra: '1 / span 2' },
  right: { value: '1', titles: '1 / span 2', body: '1 / span 2', extra: '1 / span 2' },
};

const gridColumnsValuePositionBottom = {
  left: { value: '1 / span 2', titles: '2', body: '1 / span 2', extra: '1 / span 2' },
  right: { value: '1 / span 2', titles: '1', body: '1 / span 2', extra: '1 / span 2' },
};

const gridColumns = {
  top: gridColumnsValuePostitionTop,
  bottom: gridColumnsValuePositionBottom,
};

const gridSingleColumn = { value: '1', titles: '1', body: '1', extra: '1' };

const getGridTemplateColumnsWithIcon = (iconAlign: HorizontalSide, iconSize: number) => {
  const iconSizeWithPadding = `${iconSize + PADDING}px`;
  return iconAlign === 'left' ? `${iconSizeWithPadding} minmax(0, 1fr)` : `minmax(0, 1fr)${iconSizeWithPadding}`;
};

/** @internal */
export interface TextColors {
  /**
   * Default color, used for the title and the heading
   */
  highContrast: Color;
  subtitle: Color;
  extra: Color;
}

interface MetricTextprops {
  id: string;
  datum: MetricDatum;
  style: MetricStyle;
  onElementClick?: () => void;
  progressBarSize: ProgressBarSize;
  textDimensions: MetricTextDimensions;
  colors: TextColors;
}

/** @internal */
export const MetricText: React.FC<MetricTextprops> = ({
  id,
  datum,
  style,
  onElementClick,
  progressBarSize,
  textDimensions,
  colors,
}) => {
  const { heightBasedSizes: sizes, hasProgressBar, progressBarDirection, visibility, textParts } = textDimensions;
  const { extra, body } = datum;

  const containerClassName = classNames('echMetricText', {
    [`echMetricText--${progressBarSize}`]: hasProgressBar,
    'echMetricText--vertical': progressBarDirection === LayoutDirection.Vertical,
    'echMetricText--horizontal': progressBarDirection === LayoutDirection.Horizontal,
  });

  const { valuePosition, iconAlign } = style;
  const isIconVisible = !!datum.icon;

  // If an icon is present, use a two-column grid (icon + content) by overriding the default gridTemplateColumns
  const gridTemplateColumns = isIconVisible ? getGridTemplateColumnsWithIcon(iconAlign, sizes.iconSize) : undefined;

  const iconGridStyles = isIconVisible ? { gridRow: '1', gridColumn: iconAlign === 'left' ? '1' : '2' } : {};

  const currentGridRows = gridRows[valuePosition];
  const currentGridColumns = isIconVisible ? gridColumns[valuePosition][iconAlign] : gridSingleColumn;

  let extraElement = null;
  if (isSecondaryMetricProps(extra)) {
    const { style: extraStyle = {}, ...rest } = extra;
    extraElement = (
      <SecondaryMetric {...rest} style={{ ...extraStyle, fontSize: sizes.extraFontSize, color: colors.extra }} />
    );
  } else if (React.isValidElement(extra) || typeof extra === 'function') {
    extraElement = (
      <p className="echMetricText__extra" style={{ fontSize: sizes.extraFontSize }}>
        {renderWithProps(extra, { fontSize: sizes.extraFontSize, color: colors.extra })}
      </p>
    );
  }

  return (
    <div className={containerClassName} style={{ color: colors.highContrast, gridTemplateColumns }}>
      <TitlesBlock
        metricId={id}
        title={datum.title}
        subtitle={datum.subtitle}
        sizes={sizes} // titleFontSize, subtitleFontSize
        visibility={visibility} // title, subtitle, titleLines, subtitleLines
        textAlign={style.titlesTextAlign}
        titleWeight={style.titleWeight}
        isIconVisible={isIconVisible}
        titlesRow={currentGridRows.titles}
        titlesColumn={currentGridColumns.titles}
        subtitleColor={colors.subtitle}
        onElementClick={onElementClick}
      />

      {datum.icon && (
        <div
          className={classNames('echMetricText__icon', `echMetricText__icon--${style.iconAlign}`)}
          style={{ ...iconGridStyles }}
        >
          {renderWithProps(datum.icon, {
            width: sizes.iconSize,
            height: sizes.iconSize,
            color: colors.highContrast,
          })}
        </div>
      )}

      <div
        className="echMetricText__gap"
        style={{ gridRow: currentGridRows.body, gridColumn: currentGridColumns.body }}
      >
        {body && <div className="echMetricText__body">{body}</div>}
      </div>

      {/* Extra Block */}
      <div
        className={classNames('echMetricText__extraBlock', `echMetricText__extraBlock--${style.extraTextAlign}`)}
        style={{
          gridRow: currentGridRows.extra,
          gridColumn: currentGridColumns.extra,
          color: colors.extra,
        }}
      >
        {visibility.extra && extraElement}
      </div>

      {/* Value Block */}
      <div
        className={classNames('echMetricText__valueBlock', `echMetricText__valueBlock--${style.valueTextAlign}`)}
        style={{ gridRow: currentGridRows.value, gridColumn: currentGridColumns.value }}
      >
        <p
          className="echMetricText__value"
          style={{
            fontSize: sizes.valueFontSize,
            textOverflow: isMetricWNumber(datum) ? undefined : 'ellipsis',
            color: datum.valueColor, // overrides the default color
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
              color: datum.valueColor ?? colors.highContrast,
              marginRight: style.valueTextAlign === 'center' ? -(sizes.valuePartFontSize + PADDING) : undefined,
            }}
          >
            {renderWithProps(datum.valueIcon, {
              width: sizes.valuePartFontSize,
              height: sizes.valuePartFontSize,
              color: datum.valueColor ?? colors.highContrast,
              verticalAlign: 'middle',
            })}
          </p>
        )}
      </div>
    </div>
  );
};

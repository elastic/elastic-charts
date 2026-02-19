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
import type { MetricStyle } from '../../../../utils/themes/theme';
import { isMetricWNumber, isSecondaryMetricProps } from '../../specs';
import type { MetricDatum } from '../../specs';

const GRID_SPAN_THREE = '1 / span 3';

const gridRows = {
  top: { value: '1', titles: '2', body: '3', extra: '4' },
  middle: { value: '3', titles: '1', body: '2', extra: '4' },
  bottom: { value: '4', titles: '1', body: '2', extra: '3' },
};

const gridSingleColumn = { value: '1', titles: '1', body: '1', extra: '1' };

const gridColumnsValuePostitionTop = {
  left: { value: '2 / span 2', titles: GRID_SPAN_THREE, body: GRID_SPAN_THREE, extra: GRID_SPAN_THREE },
  right: { value: '1 / span 2', titles: GRID_SPAN_THREE, body: GRID_SPAN_THREE, extra: GRID_SPAN_THREE },
};

const gridColumnsValuePositionBottom = {
  left: { value: GRID_SPAN_THREE, titles: '2 / span 2', body: GRID_SPAN_THREE, extra: GRID_SPAN_THREE },
  right: { value: GRID_SPAN_THREE, titles: '1 / span 2', body: GRID_SPAN_THREE, extra: GRID_SPAN_THREE },
};

const gridColumnsValuePositionMiddle = {
  left: { value: GRID_SPAN_THREE, titles: '2 / span 2', body: GRID_SPAN_THREE, extra: GRID_SPAN_THREE },
  right: { value: GRID_SPAN_THREE, titles: '1 / span 2', body: GRID_SPAN_THREE, extra: GRID_SPAN_THREE },
};

const gridColumns = {
  top: gridColumnsValuePostitionTop,
  middle: gridColumnsValuePositionMiddle,
  bottom: gridColumnsValuePositionBottom,
};

// Allways use three columns when the icon is visible for symmetry and centering
const getGridTemplateColumnsWithIcon = (iconSize: number) => {
  const iconSizeWithPadding = `${iconSize + PADDING}px`;
  return `${iconSizeWithPadding} minmax(0, 1fr) ${iconSizeWithPadding}`;
};

const gridTemplateRows = {
  bottom: `min-content auto min-content min-content`,
  middle: `min-content 1fr min-content min-content 1fr`,
  top: `min-content min-content auto min-content`,
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
  defaultBadgeBorderColor?: Color;
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
  defaultBadgeBorderColor,
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

  const gridTemplateColumns = isIconVisible ? getGridTemplateColumnsWithIcon(sizes.iconSize) : undefined;
  const currentGridTemplateRows = gridTemplateRows[valuePosition];

  const iconGridStyles = isIconVisible ? { gridRow: '1', gridColumn: iconAlign === 'left' ? '1' : '3' } : {};

  const currentGridRows = gridRows[valuePosition];

  let currentGridColumns = isIconVisible ? gridColumns[valuePosition][iconAlign] : gridSingleColumn;
  if (isIconVisible && valuePosition === 'top' && style.valueTextAlign === 'center') {
    currentGridColumns = { ...currentGridColumns, value: '2' }; // Center value in middle column
  }
  if (isIconVisible && valuePosition === 'bottom' && style.titlesTextAlign === 'center') {
    currentGridColumns = { ...currentGridColumns, titles: '2' }; // Center titles in middle column
  }

  let extraElement: React.JSX.Element | null = null;
  if (isSecondaryMetricProps(extra)) {
    const { style: extraStyle = {}, ...secondaryMetricProps } = extra;

    const { badgeBorderColor: rawBorder = { mode: 'none' }, ...restSecondaryMetricProps } = secondaryMetricProps;
    const resolvedBadgeBorderColor: Color | undefined =
      rawBorder.mode === 'none' ? undefined : rawBorder.mode === 'auto' ? defaultBadgeBorderColor : rawBorder.color;

    extraElement = (
      <SecondaryMetric
        style={{ ...extraStyle, fontSize: sizes.extraFontSize, color: colors.extra }}
        {...restSecondaryMetricProps}
        badgeBorderColor={resolvedBadgeBorderColor}
      />
    );
  } else if (React.isValidElement(extra) || typeof extra === 'function') {
    extraElement = (
      <p className="echMetricText__extra" style={{ fontSize: sizes.extraFontSize }}>
        {renderWithProps(extra, { fontSize: sizes.extraFontSize, color: colors.extra })}
      </p>
    );
  }

  return (
    <div
      className={containerClassName}
      style={{ color: colors.highContrast, gridTemplateColumns, gridTemplateRows: currentGridTemplateRows }}
    >
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
        className={classNames(
          'echMetricText__extraBlock',
          `echMetricText__extraBlock--${style.extraTextAlign}`,
          `echMetricText__extraBlock--${valuePosition}`,
        )}
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
              verticalAlign: 'middle' as const,
            })}
          </p>
        )}
      </div>
    </div>
  );
};

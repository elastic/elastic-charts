/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import React, { CSSProperties } from 'react';

import { getMetricTextPartDimensions, PADDING, VALUE_PART_FONT_RATIO } from './text_measurements';
import { Color } from '../../../../common/colors';
import { LayoutDirection, renderWithProps } from '../../../../utils/common';
import { Size } from '../../../../utils/dimensions';
import { MetricStyle } from '../../../../utils/themes/theme';
import { isMetricWNumber, MetricDatum } from '../../specs';

function lineClamp(maxLines: number): CSSProperties {
  return {
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: maxLines, // due to an issue with react CSSProperties filtering out this line, see https://github.com/facebook/react/issues/23033
    lineClamp: maxLines,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    whiteSpace: 'pre-wrap',
  };
}

/** @internal */
export const MetricText: React.FunctionComponent<{
  id: string;
  datum: MetricDatum;
  panel: Size;
  style: MetricStyle;
  onElementClick?: () => void;
  highContrastTextColor: Color;
  progressBarSize: 'small';
  fittedValueFontSize: number;
  locale: string;
}> = ({
  id,
  datum,
  panel,
  style,
  onElementClick,
  highContrastTextColor,
  progressBarSize,
  locale,
  fittedValueFontSize,
}) => {
  const { sizes, hasProgressBar, progressBarDirection, visibility, textParts } = getMetricTextPartDimensions(
    datum,
    panel,
    style,
    locale,
  );
  const { extra, body } = datum;
  const containerClassName = classNames('echMetricText', {
    [`echMetricText--${progressBarSize}`]: hasProgressBar,
    'echMetricText--vertical': progressBarDirection === LayoutDirection.Vertical,
    'echMetricText--horizontal': progressBarDirection === LayoutDirection.Horizontal,
  });

  const { valueFontSize, valuePartFontSize } =
    style.valueFontSize === 'fit'
      ? {
          valueFontSize: fittedValueFontSize,
          valuePartFontSize: fittedValueFontSize / VALUE_PART_FONT_RATIO,
        }
      : sizes;

  const TitleElement = () => (
    <span
      style={{
        fontSize: sizes.titleFontSize,
        textAlign: style.titlesTextAlign,
        ...lineClamp(visibility.titleLines.length),
      }}
      title={datum.title}
    >
      {datum.title}
    </span>
  );
  return (
    <div className={containerClassName} style={{ color: highContrastTextColor }}>
      <div
        className={classNames('echMetricText__titlesBlock', `echMetricText__titlesBlock--${style.titlesTextAlign}`)}
        style={
          datum.icon && {
            marginLeft: 'center' === style.titlesTextAlign || style.iconAlign === 'left' ? sizes.iconSize + PADDING : 0,
            marginRight:
              'center' === style.titlesTextAlign || style.iconAlign === 'right' ? sizes.iconSize + PADDING : 0,
          }
        }
      >
        {visibility.title && (
          <h2 id={id} className="echMetricText__title">
            {onElementClick ? (
              <button
                // ".echMetric" displays an outline halo;
                // inline styles protect us from unintended overrides of these styles.
                style={{ outline: 'none' }}
                onMouseDown={(e) => e.stopPropagation()}
                onMouseUp={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onElementClick();
                }}
              >
                <TitleElement />
              </button>
            ) : (
              <TitleElement />
            )}
          </h2>
        )}
        {visibility.subtitle && (
          <p
            className="echMetricText__subtitle"
            style={{
              fontSize: sizes.subtitleFontSize,
              ...lineClamp(visibility.subtitleLines.length),
            }}
            title={datum.subtitle}
          >
            {datum.subtitle}
          </p>
        )}
      </div>

      {datum.icon && (
        <div className={classNames('echMetricText__icon', `echMetricText__icon--${style.iconAlign}`)}>
          {renderWithProps(datum.icon, {
            width: sizes.iconSize,
            height: sizes.iconSize,
            color: highContrastTextColor,
          })}
        </div>
      )}

      <div className="echMetricText__gap">{body && <div className="echMetricText__body">{body}</div>}</div>

      <div className={classNames('echMetricText__valuesBlock', `echMetricText__valuesBlock--${style.valuesTextAlign}`)}>
        <div>
          {visibility.extra && (
            <p className="echMetricText__extra" style={{ fontSize: sizes.extraFontSize }}>
              {extra}
            </p>
          )}
        </div>

        <div className="echMetricText__valueGroup">
          <p
            className="echMetricText__value"
            style={{
              fontSize: valueFontSize,
              textOverflow: isMetricWNumber(datum) ? undefined : 'ellipsis',
              color: datum.valueColor,
            }}
            title={textParts.map(({ text }) => text).join('')}
          >
            {textParts.map(({ emphasis, text }, i) => {
              return emphasis === 'small' ? (
                <span
                  key={`${text}${i}`}
                  className="echMetricText__part"
                  style={{
                    fontSize: valuePartFontSize,
                  }}
                >
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
                fontSize: valueFontSize,
                color: datum.valueColor ?? highContrastTextColor,
                marginRight: style.valuesTextAlign === 'center' ? -(valuePartFontSize + PADDING) : undefined,
              }}
            >
              {renderWithProps(datum.valueIcon, {
                width: valuePartFontSize,
                height: valuePartFontSize,
                color: datum.valueColor ?? highContrastTextColor,
                verticalAlign: 'middle',
              })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

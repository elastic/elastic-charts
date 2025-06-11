/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import React from 'react';

import type { MetricTextDimensions } from './text_measurements';
import { PADDING } from './text_measurements';
import { TitlesBlock } from './titles';
import type { Color } from '../../../../common/colors';
import { LayoutDirection, renderWithProps } from '../../../../utils/common';
import type { MetricStyle } from '../../../../utils/themes/theme';
import type { MetricDatum } from '../../specs';
import { isMetricWNumber } from '../../specs';

interface MetricTextprops {
  id: string;
  datum: MetricDatum;
  style: MetricStyle;
  onElementClick?: () => void;
  highContrastTextColor: Color;
  progressBarSize: 'small';
  textDimensions: MetricTextDimensions;
}

/** @internal */
export const MetricText: React.FC<MetricTextprops> = ({
  id,
  datum,
  style,
  onElementClick,
  highContrastTextColor,
  progressBarSize,
  textDimensions,
}) => {
  const { heightBasedSizes: sizes, hasProgressBar, progressBarDirection, visibility, textParts } = textDimensions;
  const { extra, body } = datum;

  const containerClassName = classNames('echMetricText', {
    [`echMetricText--${progressBarSize}`]: hasProgressBar,
    'echMetricText--vertical': progressBarDirection === LayoutDirection.Vertical,
    'echMetricText--horizontal': progressBarDirection === LayoutDirection.Horizontal,
  });

  return (
    <div className={containerClassName} style={{ color: highContrastTextColor }}>
      {/* Titles Block */}
      <TitlesBlock
        metricId={id}
        title={datum.title}
        subtitle={datum.subtitle}
        sizes={sizes} // titleFontSize, subtitleFontSize, iconSize
        visibility={visibility} // title, subtitle, titleLines, subtitleLines
        textAlign={style.titlesTextAlign}
        isIconVisible={!!datum.icon}
        iconAlign={style.iconAlign}
        onElementClick={onElementClick}
      />

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

      {/* Extra Block */}
      <div className={classNames('echMetricText__extraBlock', `echMetricText__extraBlock--${style.extraTextAlign}`)}>
        {visibility.extra && (
          <p className="echMetricText__extra" style={{ fontSize: sizes.extraFontSize }}>
            {renderWithProps(extra, { fontSize: sizes.extraFontSize, color: highContrastTextColor })}
          </p>
        )}
      </div>

      {/* Value Block */}
      <div className={classNames('echMetricText__valueBlock', `echMetricText__valueBlock--${style.valueTextAlign}`)}>
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
              color: datum.valueColor ?? highContrastTextColor,
              marginRight: style.valueTextAlign === 'center' ? -(sizes.valuePartFontSize + PADDING) : undefined,
            }}
          >
            {renderWithProps(datum.valueIcon, {
              width: sizes.valuePartFontSize,
              height: sizes.valuePartFontSize,
              color: datum.valueColor ?? highContrastTextColor,
              verticalAlign: 'middle',
            })}
          </p>
        )}
      </div>
    </div>
  );
};

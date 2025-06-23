/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import type { CSSProperties } from 'react';
import React, { useMemo } from 'react';

import type { HeightBasedSizes, Visibility } from './text_measurements';
import type { Color } from '../../../../common/colors';
import type { FontWeight, TextAlign } from '../../../../utils/themes/theme';

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

interface TitleElementProps {
  title: string | undefined;
  titleWeight: FontWeight;
  fontSize: number;
  textAlign: TextAlign;
  linesLength: number;
}

const TitleElement: React.FunctionComponent<TitleElementProps> = ({
  title,
  titleWeight,
  fontSize,
  textAlign,
  linesLength,
}) => {
  const fontWeight = titleWeight === 'regular' ? 'normal' : titleWeight;
  return (
    <span
      title={title}
      style={{
        fontSize,
        textAlign,
        fontWeight,
        ...lineClamp(linesLength),
      }}
    >
      {title}
    </span>
  );
};

interface TitleProps {
  metricId: string;
  onElementClick?: () => void;
  titleElementProps: TitleElementProps;
}

const Title: React.FC<TitleProps> = ({ metricId, onElementClick, titleElementProps }) => {
  return (
    <h2 id={metricId} className="echMetricText__title">
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
          <TitleElement {...titleElementProps} />
        </button>
      ) : (
        <TitleElement {...titleElementProps} />
      )}
    </h2>
  );
};

interface SubtitleProps {
  subtitle: string | undefined;
  fontSize: number;
  subtitleLines: string[];
  color: Color;
}

const Subtitle: React.FC<SubtitleProps> = ({ subtitle, fontSize, subtitleLines, color }) => {
  return (
    <p
      className="echMetricText__subtitle"
      style={{
        fontSize,
        color,
        ...lineClamp(subtitleLines.length),
      }}
      title={subtitle}
    >
      {subtitle}
    </p>
  );
};

interface TitlesBlockProps {
  // Identification & text
  metricId: string;
  title: string | undefined;
  subtitle: string | undefined;

  // Layout & sizing
  sizes: HeightBasedSizes;
  visibility: Visibility;

  // Alignment & icon
  textAlign: TextAlign;
  titleWeight: FontWeight;
  isIconVisible: boolean;

  titlesRow: number;
  titlesColumn: string;

  subtitleColor: Color;

  // Events
  onElementClick?: () => void;
}

/** @internal */
export const TitlesBlock: React.FC<TitlesBlockProps> = ({
  metricId,
  title,
  subtitle,
  sizes,
  visibility,
  textAlign,
  titleWeight,
  isIconVisible,
  titlesRow,
  titlesColumn,
  subtitleColor,
  onElementClick,
}) => {
  const { titleFontSize, subtitleFontSize } = sizes;
  const { title: showTitle, subtitle: showSubtitle, titleLines, subtitleLines } = visibility;

  const titlesBlockStyle = useMemo(() => {
    if (!isIconVisible) return undefined;
    return {
      gridRow: titlesRow,
      gridColumn: titlesColumn,
    };
  }, [isIconVisible, titlesRow, titlesColumn]);

  const titleElementProps = {
    title,
    fontSize: titleFontSize,
    textAlign,
    titleWeight,
    linesLength: titleLines.length,
  };

  return (
    <div
      className={classNames('echMetricText__titlesBlock', `echMetricText__titlesBlock--${textAlign}`)}
      style={titlesBlockStyle}
    >
      {showTitle && <Title metricId={metricId} onElementClick={onElementClick} titleElementProps={titleElementProps} />}

      {showSubtitle && (
        <Subtitle subtitle={subtitle} fontSize={subtitleFontSize} subtitleLines={subtitleLines} color={subtitleColor} />
      )}
    </div>
  );
};

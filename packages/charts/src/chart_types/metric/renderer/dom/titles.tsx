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
    <span style={{ fontSize, textAlign, fontWeight, ...lineClamp(linesLength) }} title={title}>
      {title}
    </span>
  );
};

interface TitleHeadingProps {
  metricId: string;
  onElementClick?: () => void;
  titleProps: TitleElementProps;
}

const TitleHeading: React.FC<TitleHeadingProps> = ({ metricId, onElementClick, titleProps }) => {
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
          <TitleElement {...titleProps} />
        </button>
      ) : (
        <TitleElement {...titleProps} />
      )}
    </h2>
  );
};

interface SubtitleElementProps {
  subtitle: string | undefined;
  fontSize: number;
  subtitleLines: string[];
}

const SubtitleElement: React.FC<SubtitleElementProps> = ({ subtitle, fontSize, subtitleLines }) => {
  return (
    <p
      className="echMetricText__subtitle"
      style={{
        fontSize,
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

  const titleProps = {
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
      {showTitle && <TitleHeading metricId={metricId} onElementClick={onElementClick} titleProps={titleProps} />}

      {showSubtitle && (
        <SubtitleElement subtitle={subtitle} fontSize={subtitleFontSize} subtitleLines={subtitleLines} />
      )}
    </div>
  );
};

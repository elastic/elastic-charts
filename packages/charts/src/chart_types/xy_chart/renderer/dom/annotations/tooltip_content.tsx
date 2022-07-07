/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { useCallback } from 'react';

import { TooltipHeader, TooltipWrapper } from '../../../../../components/tooltip';
import { AnnotationType, LineAnnotationDatum, RectAnnotationDatum } from '../../../../specs';
import { AnnotationTooltipState } from '../../../annotations/types';

/** @internal */
export const TooltipContent = ({
  annotationType,
  datum,
  customTooltip: CustomTooltip,
  customTooltipDetails,
}: AnnotationTooltipState) => {
  const renderLine = useCallback(() => {
    const { details, dataValue, header = dataValue.toString() } = datum as LineAnnotationDatum;
    return (
      <TooltipWrapper className="echAnnotation__tooltip">
        <TooltipHeader>{header}</TooltipHeader>
        <div className="echAnnotation__details">{customTooltipDetails ? customTooltipDetails(details) : details}</div>
      </TooltipWrapper>
    );
  }, [datum, customTooltipDetails]);

  const renderRect = useCallback(() => {
    const { details } = datum as RectAnnotationDatum;
    const tooltipContent = customTooltipDetails ? customTooltipDetails(details) : details;
    if (!tooltipContent) {
      return null;
    }

    return (
      <TooltipWrapper className="echAnnotation__tooltip">
        <div className="echAnnotation__details">
          <div className="echAnnotation__detailsText">{tooltipContent}</div>
        </div>
      </TooltipWrapper>
    );
  }, [datum, customTooltipDetails]);

  if (CustomTooltip) {
    const { details } = datum;
    if ('header' in datum) {
      return <CustomTooltip details={details} header={datum.header} datum={datum} />;
    }
    return <CustomTooltip details={details} datum={datum} />;
  }

  switch (annotationType) {
    case AnnotationType.Line: {
      return renderLine();
    }
    case AnnotationType.Rectangle: {
      return renderRect();
    }
    default:
      return null;
  }
};

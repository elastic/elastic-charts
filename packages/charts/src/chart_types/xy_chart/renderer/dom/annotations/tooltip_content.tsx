/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { useCallback } from 'react';

import { TooltipDivider, TooltipHeader } from '../../../../../components/tooltip';
import { renderWithProps } from '../../../../../utils/common';
import type { LineAnnotationDatum, RectAnnotationDatum } from '../../../../specs';
import { AnnotationType } from '../../../../specs';
import type { AnnotationTooltipState } from '../../../annotations/types';

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
      <>
        <TooltipHeader>{header}</TooltipHeader>
        <TooltipDivider />
        <div className="echAnnotation__details" data-testid="echAnnotationDetails">
          {customTooltipDetails ? renderWithProps(customTooltipDetails, { details }) : details}
        </div>
      </>
    );
  }, [datum, customTooltipDetails]);

  const renderRect = useCallback(() => {
    const { details } = datum as RectAnnotationDatum;
    const tooltipContent = customTooltipDetails ? renderWithProps(customTooltipDetails, { details }) : details;
    if (!tooltipContent) {
      return null;
    }

    return (
      <div className="echAnnotation__details" data-testid="echAnnotationDetails">
        {tooltipContent}
      </div>
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

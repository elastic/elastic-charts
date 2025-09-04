/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { RefObject } from 'react';
import React, { useCallback, useMemo, useEffect } from 'react';

import { TooltipContent } from './tooltip_content';
import type { TooltipPortalSettings } from '../../../../../components/portal';
import { TooltipPortal, Placement } from '../../../../../components/portal';
import { TooltipWrapper } from '../../../../../components/tooltip';
import type { AnnotationTooltipState } from '../../../annotations/types';

interface AnnotationTooltipProps {
  state: AnnotationTooltipState | null;
  chartRef: RefObject<HTMLDivElement>;
  chartId: string;
  zIndex: number;
  onScroll?: () => void;
}

/** @internal */
export const AnnotationTooltip = ({ state, chartRef, chartId, onScroll, zIndex }: AnnotationTooltipProps) => {
  const renderTooltip = useCallback(() => {
    if (!state || !state.isVisible) {
      return null;
    }

    return (
      <TooltipWrapper
        // actions not used on annotations yet
        actions={[]}
        actionPrompt=""
        pinningPrompt=""
        selectionPrompt=""
        actionsLoading=""
        noActionsLoaded=""
        className="echAnnotation"
        data-testid="echAnnotation"
      >
        <TooltipContent {...state} />
      </TooltipWrapper>
    );
  }, [state]);

  const handleScroll = () => {
    // TODO: handle scroll cursor update
    if (onScroll) {
      onScroll();
    }
  };

  useEffect(() => {
    if (onScroll) {
      window.addEventListener('scroll', handleScroll, true);
      return () => window.removeEventListener('scroll', handleScroll, true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const popperSettings = useMemo((): TooltipPortalSettings | undefined => {
    const settings = state?.tooltipSettings;
    if (!settings) {
      return;
    }

    const { placement, boundary, ...rest } = settings;

    return {
      ...rest,
      placement: placement ?? Placement.Right,
      boundary: boundary === 'chart' ? chartRef.current ?? undefined : boundary,
    };
  }, [state?.tooltipSettings, chartRef]);

  const position = useMemo(() => state?.anchor ?? null, [state?.anchor]);
  if (!state?.isVisible) {
    return null;
  }
  return (
    <TooltipPortal
      scope="AnnotationTooltip"
      chartId={chartId}
      // increasing by 100 the tooltip portal zIndex to avoid conflicts with highlighters and other elements in the DOM
      zIndex={zIndex + 100}
      anchor={{
        position,
        appendRef: chartRef,
      }}
      visible={state?.isVisible ?? false}
      settings={popperSettings}
    >
      {renderTooltip()}
    </TooltipPortal>
  );
};

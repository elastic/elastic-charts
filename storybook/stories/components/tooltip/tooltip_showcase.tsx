/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, color } from '@storybook/addon-knobs';
import React, { memo, useEffect, useRef, useState } from 'react';

import {
  BaseDatum,
  Datum,
  SeriesIdentifier,
  TooltipProps,
  LIGHT_THEME,
  DEFAULT_TOOLTIP_SPEC,
  TooltipSpec,
  TooltipValue,
} from '@elastic/charts';
import { TooltipComponent, TooltipComponentProps } from '@elastic/charts/src/components/tooltip/tooltip';

import { customKnobs } from '../../utils/knobs';

import './tooltip_showcase.scss';

type BaseTooltipProps<
  D extends BaseDatum = Datum,
  SI extends SeriesIdentifier = SeriesIdentifier,
> = TooltipComponentProps<D, SI>;

type TooltipShowcaseProps<D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier> = Partial<
  Omit<TooltipComponentProps<D, SI>, 'settings' | 'visible' | 'tooltip'>
> & { tooltip?: Partial<TooltipComponentProps<D, SI>['tooltip']> } & Partial<TooltipProps<D, SI>>;

const TooltipShowcaseInner = <D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier>(
  props: TooltipShowcaseProps<D, SI>,
) => {
  const [, setVisible] = useState(false);
  const [selected, setSelected] = useState<TooltipValue<D, SI>[]>([]);
  const divRef = useRef<HTMLDivElement | null>(null);
  const anchorRef = useRef<HTMLDivElement | null>(null);

  // Required to initially rerender tooltip
  useEffect(() => {
    setVisible(true);
    return () => setVisible(false);
  }, []);

  const tooltipProps: BaseTooltipProps<D, SI> = {
    zIndex: 200,
    info: props.info,
    settings: {
      ...props,
      placement: customKnobs.enum.placement(),
      boundary: divRef.current ?? undefined,
    },
    rotation: 0,
    visible: boolean('visible', true),
    backgroundColor: color('backgroundColor', '#E8F9FD'),
    getChartContainerRef: () => divRef,
    // @ts-ignore - overriding mouse logic
    onPointerMove: () => {},
    toggleSelectedTooltipItem: (rawitem) => {
      const item = rawitem as TooltipValue<D, SI>;
      const index = selected.indexOf(item);
      setSelected((prev) => {
        if (index === -1) return [...prev, item];
        return prev.filter((i) => i !== item);
      });
    },
    setSelectedTooltipItems: (items) => {
      setSelected(items as TooltipValue<D, SI>[]);
    },
    pinTooltip() {
      setSelected([]);
    },
    canPinTooltip: false,
    pinned: false,
    selected,
    maxTooltipItems: 5,
    tooltipTheme: LIGHT_THEME.tooltip,
    ...props,
    tooltip: {
      ...(DEFAULT_TOOLTIP_SPEC as unknown as TooltipSpec<D, SI>),
      ...props.tooltip,
    },
  };

  return (
    <div ref={divRef} style={{ backgroundColor: tooltipProps.backgroundColor }} className="showcase">
      <div className="tooltip-wrapper">
        <div id="tooltip-anchor" ref={anchorRef}>
          Tooltip Anchor
        </div>
        <TooltipComponent {...tooltipProps} anchorRef={anchorRef} />
      </div>
    </div>
  );
};

/**
 * This component is used to render the internal `TooltipComponent` as a standalone element.
 *
 * - No connection to redux
 * - Everything is overridable
 * - Limited defaults, logic must be manually implemented above or when used
 */
export const TooltipShowcase = memo(TooltipShowcaseInner) as typeof TooltipShowcaseInner;

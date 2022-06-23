/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, color } from '@storybook/addon-knobs';
import React, { ComponentProps, memo, useEffect, useRef, useState } from 'react';

import { TooltipProps } from '@elastic/charts';
import { TooltipComponent } from '@elastic/charts/src/components/tooltip/tooltip';

import { getPlacementKnob } from '../../utils/knobs';

import './tooltip_showcase.scss';

type BaseTooltipProps = ComponentProps<typeof TooltipComponent>;

type TooltipShowcaseProps = Partial<Omit<BaseTooltipProps, 'settings' | 'visible'>> & {
  settings?: Partial<TooltipProps>;
};

export const TooltipShowcase = memo((props: TooltipShowcaseProps) => {
  const [visible, setVisible] = useState(false)
  const divRef = useRef<HTMLDivElement | null>(null);
  const anchorRef = useRef<HTMLDivElement| null>(null);

  useEffect(() => {
    setVisible(true)
    return () => setVisible(false)
  }, []);

  const tooltipProps: BaseTooltipProps = {
    ...props,
    zIndex: 200,
    info: props.info,
    settings: {
      ...props.settings,
      placement: getPlacementKnob(),
      boundary: divRef.current ?? undefined,
    },
    rotation: 0,
    visible: boolean('visible', true),
    backgroundColor: color('backgroundColor', '#E8F9FD'),
    getChartContainerRef: () => divRef,
    // @ts-ignore - overriding mouse logic
    onPointerMove: () => {},
  };

  return (
    <div ref={divRef} style={{ backgroundColor: tooltipProps.backgroundColor }} className="showcase">
      <div className="tooltip-wrapper">
        <div id="tooltip-anchor" ref={anchorRef}>
          Tooltip Anchor
        </div>
        <TooltipComponent
          {...tooltipProps}
          anchorRef={anchorRef}
        />
      </div>
    </div>
  );
});

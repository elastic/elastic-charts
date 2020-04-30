/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License. */

import React, { useCallback, useMemo } from 'react';

import { Portal, Placement } from '../../../../../components/portal';
import { AnnotationTooltipState } from '../../../annotations/types';
import { TooltipContent } from './tooltip_content';

interface RectAnnotationTooltipProps {
  state: AnnotationTooltipState | null;
  chartRef: HTMLDivElement | null;
}

/** @internal */
export const AnnotationTooltiper = ({ state, chartRef }: RectAnnotationTooltipProps) => {
  const renderTooltip = useCallback(() => {
    if (!state || !state.isVisible) {
      return null;
    }

    return <TooltipContent {...state} />;
  }, [state, state?.isVisible, state?.annotationType]);

  const position = useMemo(() => state?.anchor ?? null, [state, state?.anchor]);
  const placement = useMemo(() => state?.anchor?.position ?? Placement.Right, [state, state?.anchor?.position]);

  console.log(state?.anchor);

  return (
    <Portal
      scope="RectAnnotationTooltip"
      anchor={{
        position,
        ref: chartRef,
      }}
      visible={!(state?.isVisible ?? false)}
      settings={{
        placement,
      }}
    >
      {renderTooltip()}
    </Portal>
  );
};

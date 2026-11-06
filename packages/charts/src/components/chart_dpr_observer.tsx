/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { updateDevicePixelRatio } from '../state/actions/chart_settings';
import type { GlobalChartState } from '../state/chart_state';
import { getRendererSelector } from '../state/selectors/get_renderer';

/** @internal */
export function ChartDPRObserver() {
  const dispatch = useDispatch();
  const renderer = useSelector((state: GlobalChartState) => getRendererSelector(state));

  useEffect(() => {
    // an svg stage is resolution independent
    if (renderer === 'svg' || typeof window.matchMedia !== 'function') return;

    // the ratio is not tracked while the stage is svg, so a switch back to canvas starts from the current one
    dispatch(updateDevicePixelRatio(window.devicePixelRatio));

    // the query matches the current ratio only, so it is replaced after each change
    let query: MediaQueryList | undefined;
    const onChange = () => {
      dispatch(updateDevicePixelRatio(window.devicePixelRatio));
      listen();
    };
    const listen = () => {
      query?.removeEventListener('change', onChange);
      query = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
      query.addEventListener('change', onChange, { once: true });
    };

    listen();
    return () => query?.removeEventListener('change', onChange);
  }, [dispatch, renderer]);

  return null;
}

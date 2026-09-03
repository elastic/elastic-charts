/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { updateDevicePixelRatio } from '../state/actions/chart_settings';

/** @internal */
export function ChartDPRObserver() {
  const dispatch = useDispatch();

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;

    const setupListener = () => {
      window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`).addEventListener(
        'change',
        () => {
          dispatch(updateDevicePixelRatio(window.devicePixelRatio));
          setupListener();
        },
        { once: true },
      );
    };

    setupListener();
  }, [dispatch]);

  return null;
}

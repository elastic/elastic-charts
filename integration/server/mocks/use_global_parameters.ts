/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { useState } from 'react';

interface WithParameters {
  (): JSX.Element;
  parameters?: {
    backgrounds?: {
      default?: string;
      [key: string]: any;
    };
    themes?: {
      default: string;
      [key: string]: any;
    };
    [key: string]: any;
  };
}

function setTheme(name: string) {
  if (name === 'Light') {
    document.querySelector('html')?.classList.add('light-theme');
    document.querySelector('html')?.classList.remove('dark-theme');
  } else {
    document.querySelector('html')?.classList.add('dark-theme');
    document.querySelector('html')?.classList.remove('light-theme');
  }
}

export function useGlobalsParameters() {
  const [themeName, setThemeName] = useState<string>('Light');
  const [backgroundColor, setBackgroundColor] = useState<string | undefined>('White');

  /**
   * Handles setting global context values. Stub for theme and background addons
   */
  function setParams<T extends WithParameters>({ parameters }: T, params: URLSearchParams) {
    const globals = getGlobalParams(params);
    const newThemeName = parameters?.themes?.default ?? globals.themes;
    setThemeName(newThemeName);
    setTheme(newThemeName);
    setBackgroundColor(parameters?.backgrounds?.value ?? globals.backgrounds);
  }

  return {
    themeName,
    backgroundColor,
    setParams,
  };
}

function getGlobalParams(params: URLSearchParams) {
  const globals = params.get('globals') ?? '';
  const map = Object.fromEntries(globals.split(';').map((pair: string) => pair.split(':')));

  return {
    backgrounds: map['backgrounds.value'],
    themes: map['themes.value'] ?? 'Light',
  };
}

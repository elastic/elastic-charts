/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { useMemo, useState } from 'react';

import type { StoryGlobals } from './../../../storybook/types';
import { BackgroundParameter } from '../../../storybook/node_modules/storybook-addon-background-toggle';
import { ThemeParameter } from '../../../storybook/node_modules/storybook-addon-theme-toggle';
import { storybookParameters as globalParams } from '../../../storybook/parameters';
import { ThemeId } from '../../../storybook/use_base_theme';

type Parameters = BackgroundParameter & ThemeParameter;

const themeParams = globalParams.theme!;
const backgroundParams = globalParams.background!;

const combineClasses = (classes: string | string[]) => (typeof classes === 'string' ? [classes] : classes);
const getThemeAllClasses = ({ themes }: Required<ThemeParameter>['theme']) =>
  themes.reduce<string[]>((acc, t) => {
    if (!t.class) return acc;
    return [...acc, ...(typeof t.class === 'string' ? [t.class] : t.class)];
  }, []);
const getTargetSelector = ({ selector }: Required<ThemeParameter>['theme']) =>
  (Array.isArray(selector) ? selector.join(', ') : selector) ?? 'body';

function applyThemeCSS(themeId: string) {
  const theme = themeParams.themes.find((t) => t.id === themeId);
  const selector = getTargetSelector(themeParams);
  const targets = selector ? document.querySelectorAll<HTMLElement>(selector) : null;

  if (targets) {
    const all = getThemeAllClasses(themeParams);
    const classes = theme?.class ? combineClasses(theme.class) : null;

    targets.forEach((e) => {
      all.forEach((c) => e.classList.remove(c));
      if (classes) classes.forEach((c) => e.classList.add(c));
    });
  }
}

interface GlobalParameters {
  themeId: StoryGlobals['theme'];
  backgroundId: StoryGlobals['background'];
  toggles: StoryGlobals['toggles'];
  setParams(params: URLSearchParams, parameters?: Parameters): void;
}

export function useGlobalsParameters(): GlobalParameters {
  const [themeId, setThemeId] = useState<string>(ThemeId.Light);
  const [backgroundId, setBackgroundId] = useState<string | undefined>('white');
  const [togglesJSON, setTogglesJSON] = useState<string>('{}');

  /**
   * Handles setting global context values. Stub for theme and background addons
   */
  function setParams(params: URLSearchParams, parameters?: Parameters) {
    const globals = getGlobalParams(params);
    const backgroundIdFromParams = globals.background ?? parameters?.background?.default ?? backgroundParams.default;
    setBackgroundId(backgroundIdFromParams);
    const themeIdFromParams = globals.theme ?? parameters?.theme?.default ?? themeParams.default ?? ThemeId.Light;
    setThemeId(themeIdFromParams);
    setTogglesJSON(JSON.stringify(globals.toggles ?? '{}'));
    applyThemeCSS(themeIdFromParams);
  }

  // using toggles object creates an infinite update loop, thus using JSON state.
  const toggles = useMemo<StoryGlobals['toggles']>(() => JSON.parse(togglesJSON), [togglesJSON]);

  return {
    themeId,
    backgroundId,
    toggles,
    setParams,
  };
}

function getGlobalParams(params: URLSearchParams): StoryGlobals {
  const rawGlobals = params.get('globals') ?? '';
  const globalsArr = rawGlobals.split(';').map((pair: string) => pair.split(':'));
  return globalsArr.reduce((acc, [key, value]) => {
    const [k1, k2] = key?.split('.') ?? [];

    if (k1 && k2) {
      if (!acc[k1]) acc[k1] = {};

      // capture nested object globals (i.e. toggles.showHeader:true)
      try {
        acc[k1][k2] = value && JSON.parse(value);
      } catch {
        acc[k1][k2] = value;
      }
    } else if (k1) acc[k1] = value;
    return acc;
  }, {} as any);
}

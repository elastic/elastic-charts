/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { addons, types } from '@storybook/addons';
import { useGlobals } from '@storybook/api';
import { IconButton, Icons } from '@storybook/components';
import React from 'react';

const ADDON_ID = 'elastic-charts/renderer';

// the storybook 6.5 typings of IconButton predate the React 18 pointer capture props
const ToolButton = IconButton as unknown as React.FC<{
  title: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}>;

/**
 * Toolbar button that switches every chart of the current story between the canvas and the svg
 * renderer. It only sets the `renderer` global, which `story_wrapper.tsx` applies to
 * `Chart.defaultProps`, so it is one switch for all stories and shareable in the url as
 * `globals=renderer:svg` (the e2e tests select the svg renderer the same way).
 *
 * This lives in its own manager entry, listed last in main.js, because the toolbar shows tools in
 * registration order and the button's width changes with its label.
 */
const RendererTool = () => {
  const [globals, updateGlobals] = useGlobals();
  const svg = globals.renderer === 'svg';
  return (
    <ToolButton
      title={`Chart renderer: ${svg ? 'SVG' : 'canvas'}. Click to switch to ${svg ? 'canvas' : 'SVG'}.`}
      active={svg}
      onClick={() => updateGlobals({ renderer: svg ? 'canvas' : 'svg' })}
    >
      <Icons icon="switchalt" />
      &nbsp;{svg ? 'SVG' : 'Canvas'}
    </ToolButton>
  );
};

addons.register(ADDON_ID, () => {
  addons.add(`${ADDON_ID}/tool`, {
    type: types.TOOL,
    title: 'Chart renderer',
    match: ({ viewMode }) => viewMode === 'story',
    render: () => <RendererTool />,
  });
});

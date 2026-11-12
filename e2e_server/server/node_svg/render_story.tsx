/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { EuiProvider } from '@elastic/eui';
import { appendIconComponentCache } from '@elastic/eui/es/components/icon/icon';
import { typeToPathMap } from '@elastic/eui/es/components/icon/icon_map';
import React from 'react';

import { Chart } from '@elastic/charts';
import { checkpointRandomNumberGenerators, resetRandomNumberGenerators } from '@elastic/charts/src/mocks/utils';
import { renderChartToSVGString } from '@elastic/charts/src/server';

import { storybookParameters } from '../../../storybook/parameters';
import type { StoryContext } from '../../../storybook/types';
import { BackgroundIdProvider, ThemeIdProvider } from '../../../storybook/use_base_theme';

// a server render cannot wait for EUI to load an icon lazily, so every icon is in the cache up front
const iconAssets = (
  import.meta as unknown as {
    webpackContext: (
      dir: string,
      options: { recursive: boolean; regExp: RegExp },
    ) => {
      keys: () => string[];
      (key: string): { icon: unknown };
    };
  }
).webpackContext('@elastic/eui/es/components/icon/assets', { recursive: false, regExp: /\.js$/ });
const iconFiles = new Set(iconAssets.keys());
appendIconComponentCache(
  Object.fromEntries(
    Object.entries(typeToPathMap as Record<string, string>)
      .filter(([, file]) => iconFiles.has(`./${file}.js`))
      .map(([type, file]) => [type, iconAssets(`./${file}.js`).icon]),
  ) as Parameters<typeof appendIconComponentCache>[0],
);

interface StoryModule {
  Example: ((args: object, context: StoryContext) => React.ReactElement) & {
    parameters?: { theme?: { default?: string }; background?: { default?: string } };
  };
}

/**
 * Renders a story to a standalone SVG, the way the VRT page mounts it: the module is evaluated first and its
 * seeded generators checkpointed, the chart gets the size of its baseline screenshot.
 */
export async function renderStory(
  load: () => Promise<StoryModule>,
  size: { width: number; height: number },
): Promise<string> {
  const { Example } = await load();
  checkpointRandomNumberGenerators();
  resetRandomNumberGenerators();

  const themeId = Example.parameters?.theme?.default ?? storybookParameters.theme?.default ?? 'light';
  const backgroundId = Example.parameters?.background?.default ?? storybookParameters.background?.default;
  const context: StoryContext = { globals: { theme: themeId, background: backgroundId, toggles: {} } } as StoryContext;
  Chart.defaultProps = { ...Chart.defaultProps, renderer: 'svg' };

  const Story = () => Example({}, context);
  return renderChartToSVGString(
    <EuiProvider colorMode={themeId.includes('dark') ? 'dark' : 'light'}>
      <ThemeIdProvider value={themeId as any}>
        <BackgroundIdProvider value={backgroundId}>
          <Story />
        </BackgroundIdProvider>
      </ThemeIdProvider>
    </EuiProvider>,
    { size },
  );
}

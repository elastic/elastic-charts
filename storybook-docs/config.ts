/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

// @ts-ignore
import { DocsPage, DocsContainer } from '@storybook/addon-docs/blocks';
import { withInfo } from '@storybook/addon-info';
import { withKnobs } from '@storybook/addon-knobs';
import { addDecorator, configure, addParameters } from '@storybook/react';
import { create } from '@storybook/theming';

import { switchTheme } from './theme_service';

import './style.scss';

switchTheme('light');

addParameters({
  options: {
    theme: create({
      base: 'light',
      brandTitle: 'Elastic Charts',
      brandUrl: 'https://github.com/elastic/elastic-charts',
      brandImage:
        'https://static-www.elastic.co/v3/assets/bltefdd0b53724fa2ce/blt6ae3d6980b5fd629/5bbca1d1af3a954c36f95ed3/logo-elastic.svg',
    }),
    panelPosition: 'right',
    sidebarAnimations: true,
  },
  info: {
    inline: true,
    source: true,
    propTables: false,
    styles: {
      infoBody: {
        fontSize: '14px',
        marginTop: 0,
        marginBottom: 0,
      },
    },
  },
  docs: {
    container: DocsContainer,
    page: DocsPage,
  },
});

addDecorator(withKnobs);
addDecorator(withInfo);

configure(require.context('../docs', true, /\.(ts|tsx|mdx)$/), module);

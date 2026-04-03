/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type * as Preset from '@docusaurus/preset-classic';
import type { Config } from '@docusaurus/types';
import { themes as prismThemes } from 'prism-react-renderer';

if (!process.env.DOCUSAURUS_URL && process.env.NODE_ENV === 'production') {
  throw new Error('DOCUSAURUS_URL was not provided');
}

const config: Config = {
  title: 'Elastic Charts',
  tagline: 'A powerful, flexible data visualization library for React',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: process.env.DOCUSAURUS_URL || 'https://elastic.github.io',

  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: process.env.DOCUSAURUS_BASE_URL || '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'elastic', // Usually your GitHub org/user name.
  projectName: 'elastic-charts', // Usually your repo name.

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  plugins: [
    'docusaurus-plugin-sass',
    [
      'docusaurus-lunr-search',
      {
        indexBaseUrl: true,
        disableVersioning: true,
        highlightResult: false,
        maxHits: 30,
      },
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          editUrl: ({ docPath }) => {
            // auto generated should not have edit on github link
            if (docPath.startsWith('all-types')) return;
            return 'https://github.com/elastic/elastic-charts/blob/main/docs/';
          },
        },
        blog: false,
        pages: false,
        theme: {
          customCss: './src/css/custom.scss',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    navbar: {
      title: 'Elastic Charts',
      logo: {
        alt: 'Elastic Charts Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docs',
          position: 'left',
          label: 'Docs',
        },
        {
          type: 'docSidebar',
          sidebarId: 'api',
          position: 'left',
          label: 'API',
        },
        {
          type: 'docSidebar',
          sidebarId: 'examples',
          position: 'left',
          label: 'Examples',
        },
        {
          href: 'https://codesandbox.io/s/elastic-charts-playground-87y7g?file=/src/App.tsx',
          label: 'Playground',
          position: 'right',
          className: 'header-playground-link',
          'aria-label': 'Codesandbox link',
        },
        {
          href: process.env.DOCS_URL ? `${process.env.DOCS_URL}/storybook` : '/storybook',
          label: 'Storybook',
          position: 'right',
          target: '_blank',
          className: 'header-storybook-link',
          'aria-label': 'Storybook',
        },
        {
          href: 'https://github.com/elastic/elastic-charts',
          label: 'GitHub',
          position: 'right',
          className: 'header-github-link',
          'aria-label': 'GitHub repository',
        },
      ],
    },
    footer: {
      style: 'light',
      copyright: `Copyright © ${new Date().getFullYear()} Elasticsearch B.V.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;

/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

const fs = require('fs');
const path = require('path');

const compileImportTemplate = require('./import_template');
const compileRouteTemplate = require('./route_template');

function indexTemplate() {
  return `
import '../../storybook/style.scss';
import React from 'react';
import ReactDOM from 'react-dom';
import { VRTPage } from './vrt_page';
import { appendIconComponentCache } from '@elastic/eui/es/components/icon/icon';

appendIconComponentCache({
  arrowUp: require('@elastic/eui/es/components/icon/assets/arrow_up').icon,
  arrowLeft: require('@elastic/eui/es/components/icon/assets/arrow_left').icon,
  arrowDown: require('@elastic/eui/es/components/icon/assets/arrow_down').icon,
  arrowRight: require('@elastic/eui/es/components/icon/assets/arrow_right').icon,
  iInCircle: require('@elastic/eui/es/components/icon/assets/iInCircle').icon,
  tokenKey: require('@elastic/eui/es/components/icon/assets/tokenKey').icon,
  filter: require('@elastic/eui/es/components/icon/assets/filter').icon,
  starFilled: require('@elastic/eui/es/components/icon/assets/star_filled').icon,
  pencil: require('@elastic/eui/es/components/icon/assets/pencil').icon,
  visualizeApp: require('@elastic/eui/es/components/icon/assets/app_visualize').icon,
});

const path = new URL(window.location.toString()).searchParams.get('path');
document.getElementsByTagName('body')[0].style.overflow = path ? 'hidden' : 'scroll';
ReactDOM.render(<VRTPage />, document.getElementById('root') as HTMLElement);

`.trim();
}

function pageTemplate(imports, routes, urls) {
  return `
import React, { PropsWithChildren, FC, Suspense, CSSProperties } from 'react';
import { EuiProvider } from '@elastic/eui';
import classNames from 'classnames';

import { ThemeIdProvider, BackgroundIdProvider } from '../../storybook/use_base_theme';
import { useGlobalsParameters } from '../server/mocks/use_global_parameters';
import { StoryContext } from '../../storybook/types';

const ResizeWrapper: FC<PropsWithChildren<{ resize?: boolean | CSSProperties }>> = ({ resize, children }) => (
  <div id="story-root" className={classNames({ resizeHeight: (resize as CSSProperties)?.height === undefined })}>
    {resize ? (
      <div id="story-resize-wrapper" className="e2e-server" style={resize === true ? {} : resize}>
        {children}
      </div>
    ) : (
      <>{children}</>
    )}
  </div>
);

export function VRTPage() {
  const {
    themeId,
    backgroundId,
    toggles,
    resize,
    setParams,
  } = useGlobalsParameters();
  const urlParams = new URL(window.location.toString()).searchParams;
  const colorMode = (themeId ?? '').includes('light') ? 'light' : 'dark';
  const getStoryContext = (title, name): StoryContext => ({
    globals: {
      theme: themeId,
      background: backgroundId,
      toggles,
    },
    title: toggles.showChartTitle ?  title : undefined,
    description: toggles.showChartDescription ?  name : undefined,
  });
  ${imports.join('\n  ')}

  const path = urlParams.get('path');
  if(!path) {
    return (<>
    <h1>missing url path</h1>
      <ul>
        ${urls
          .map((url) => {
            return `<li><a href="?path=${url}">${url.slice(7)}</a></li>`;
          })
          .join('\n        ')}
      </ul>
    </>);
  }

  return (
    <ResizeWrapper resize={resize}>
      <EuiProvider colorMode={colorMode}>
        <ThemeIdProvider value={themeId as any}>
          <BackgroundIdProvider value={backgroundId}>
            <Suspense fallback={<div>Loading...</div>}>
              ${routes.join('\n            ')}
            </Suspense>
          </BackgroundIdProvider>
        </ThemeIdProvider>
      </EuiProvider>
    </ResizeWrapper>
  );
}

`.trim();
}

function compileVRTPage(examples) {
  const flatExamples = examples.reduce((acc, { exampleFiles }) => {
    acc.push(...exampleFiles);
    return acc;
  }, []);
  const { imports, routes, urls } = flatExamples.reduce(
    (acc, example, index) => {
      acc.imports.push(compileImportTemplate(example, index));
      acc.routes.push(compileRouteTemplate(example, index));
      acc.urls.push(example.url);
      return acc;
    },
    { imports: [], routes: [], urls: [] },
  );

  fs.writeFileSync(path.join('e2e_server', 'tmp', 'vrt_page.tsx'), pageTemplate(imports, routes, urls));
  fs.writeFileSync(path.join('e2e_server', 'tmp', 'index.tsx'), indexTemplate());
}

compileVRTPage(require('../../tmp/examples.json'));

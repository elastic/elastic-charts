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
import '../../packages/charts/src/theme_light.scss';
import '../../storybook/style.scss';
import React from 'react';
import ReactDOM from 'react-dom';
import { VRTPage } from './vrt_page';

ReactDOM.render(<VRTPage />, document.getElementById('story-root') as HTMLElement);

`.trim();
}

function pageTemplate(imports, routes, urls) {
  return `
import React, { Suspense } from 'react';
import { ThemeIdProvider, BackgroundIdProvider } from '../../storybook/use_base_theme';
import { useGlobalsParameters } from '../server/mocks/use_global_parameters';

export function VRTPage() {
  const {
    themeId,
    backgroundId,
    setParams,
  } = useGlobalsParameters();
  const urlParams = new URL(window.location.toString()).searchParams;
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
    <ThemeIdProvider value={themeId as any}>
      <BackgroundIdProvider value={backgroundId}>
        <Suspense fallback={<div>Loading...</div>}>
          ${routes.join('\n          ')}
        </Suspense>
      </BackgroundIdProvider>
    </ThemeIdProvider>
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
    (acc, { filePath, url }, index) => {
      acc.imports.push(compileImportTemplate(index, filePath));
      acc.routes.push(compileRouteTemplate(index, url));
      acc.urls.push(url);
      return acc;
    },
    { imports: [], routes: [], urls: [] },
  );

  fs.writeFileSync(path.join('integration', 'tmp', 'vrt_page.tsx'), pageTemplate(imports, routes, urls));
  fs.writeFileSync(path.join('integration', 'tmp', 'index.tsx'), indexTemplate());
}

compileVRTPage(require('../../tmp/examples.json'));

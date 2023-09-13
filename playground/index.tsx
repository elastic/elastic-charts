/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import 'core-js';

import React, { StrictMode } from 'react';

import '../packages/charts/src/theme_light.scss';
import '@elastic/eui/dist/eui_theme_light.css';

import { createRoot } from 'react-dom/client';

import { Playground } from './playground';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement!);

root.render(
  <StrictMode>
    <Playground />
  </StrictMode>,
);

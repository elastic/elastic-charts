/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import fs from 'fs';

import { createDeploymentStatus, firebaseDeploy, getArtifacts, startGroup } from '../../utils';

void createDeploymentStatus({ state: 'in_progress' });

fs.mkdirSync('./e2e-server/public/e2e', { recursive: true });

getArtifacts('e2e-server/public/*', 'storybook');

getArtifacts('e2e-server/public/e2e/*', 'e2e_server');

startGroup('Check deployment files');

const hasStorybookIndex = fs.existsSync('./e2e-server/public/index.html');
const hasE2EIndex = fs.existsSync('./e2e-server/public/e2e/index.html');

if (hasStorybookIndex && hasE2EIndex) {
  void firebaseDeploy();
} else {
  throw new Error('Error: Missing deployment files in e2e-server/public');
}

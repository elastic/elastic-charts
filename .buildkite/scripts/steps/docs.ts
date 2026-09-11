/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import {
  bkEnv,
  buildDocsSite,
  buildTypeDocs,
  compress,
  docsOutDir,
  getOrCreateDeploymentUrl,
  startGroup,
  yarnInstall,
} from '../../utils';
import { createDeploymentStatus, createOrUpdateDeploymentComment } from '../../utils/deployment';

void (async () => {
  await yarnInstall();
  await yarnInstall('docs');

  if (bkEnv.isPullRequest) {
    await createOrUpdateDeploymentComment({
      state: 'pending',
    });
  } else {
    await createDeploymentStatus({ state: 'pending' });
  }

  startGroup('Building docs - firebase');
  const firebaseChannelUrl = await getOrCreateDeploymentUrl();
  buildTypeDocs();
  buildDocsSite({
    docsUrl: firebaseChannelUrl,
    nodeEnv: bkEnv.isMainBranch ? 'production' : 'development',
  });

  await compress({
    src: docsOutDir,
    dest: '.buildkite/artifacts/docs/firebase.gz',
  });
})();

/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { createDeploymentStatus, exec, yarnInstall } from '../../utils';

yarnInstall();

void createDeploymentStatus({ state: 'pending' });

exec('yarn test:e2e:generate');

exec('yarn test:e2e:server:build -o "../public/e2e"');

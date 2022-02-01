/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

module.exports = {
  port: process.env.PORT || '9009',
  hostname: 'host.docker.internal',
  isLocalVRTServer: process.env.LOCAL_VRT_SERVER === 'true',
  environmentUrl: process.env.ENV_URL,
};

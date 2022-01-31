/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

module.exports = {
  debug: process.env.DEBUG === 'true',
  port: process.env.PORT || '9009',
  hostname: process.env.DEBUG === 'true' ? 'localhost' : 'host.docker.internal',
  isLocalVRTServer: process.env.LOCAL_VRT_SERVER === 'true',
  isLegacyVRTServer: process.env.LEGACY_VRT_SERVER === 'true',
};

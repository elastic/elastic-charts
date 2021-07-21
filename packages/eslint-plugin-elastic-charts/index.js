/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

module.exports = {
  rules: {
    'require-tsdocs': require('./rules/require_tsdocs'),
    'require-release-tag': require('./rules/require_release_tag'),
    'require-documentation': require('./rules/require_documentation'),
    'no-different-release-tag': require('./rules/no_different_release_tag'),
  },
};

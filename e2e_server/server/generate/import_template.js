/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

const { capitalCase } = require('change-case');

module.exports = function lazyImportTemplate({ filePath, groupTitle, name }, index) {
  return `
  const Component${index} = React.lazy(() => {
    return import('../../${filePath}').then((module) => {
      setParams(urlParams, (module.Example as any).parameters);
      const Component = module.Example.bind(module.Example, {}, getStoryContext('${groupTitle}', '${capitalCase(
        name,
      )}'))
      return { default: Component };
    });
  });`;
};

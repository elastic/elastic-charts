/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

const { INTERNAL_TAG } = require('./constants');
const utils = require('./utils');

function isUndocumented({ value }) {
  const tag = utils.getReleaseTag(value);
  if (!tag || tag === INTERNAL_TAG) return false;
  return value.replace(tag, '').replaceAll('*', '').trim() === '';
}

module.exports = {
  meta: {
    type: 'problem',
  },
  create(context) {
    return {
      // eslint-disable-next-line func-names
      'ExportNamedDeclaration[specifiers=""]:not(ExportAllDeclaration)': function (node) {
        const comment = utils.getTSDocComment(context, node);

        if (comment && isUndocumented(comment)) {
          const variableName = utils.getExportName(node);
          context.report({
            loc: comment.loc,
            message: '{{ variableName }} is undocumented',
            data: {
              variableName,
            },
          });
        }
      },
    };
  },
};

/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

const { INTERNAL_TAG, DEFAULT_TAG } = require('./constants');
const utils = require('./utils');

const emptyLineComment = '*';
const emptyBlockComment = '*\n *';

function isMissingReleaseTag({ value }) {
  return !utils.getReleaseTag(value);
}

function addTagToComment({ value }) {
  const content = value.trim();
  if (content === emptyBlockComment || content === emptyLineComment) return `/** ${INTERNAL_TAG} */`;
  if (!/\n/.test(content)) return `/**\n ${content}\n * ${DEFAULT_TAG}\n */`;
  return `/*${content}\n * ${DEFAULT_TAG}\n */`;
}

module.exports = {
  meta: {
    fixable: 'code',
    type: 'problem',
  },
  create(context) {
    return {
      // eslint-disable-next-line func-names
      'ExportNamedDeclaration[specifiers=""]:not(ExportAllDeclaration)': function (node) {
        const comment = utils.getTSDocComment(context, node);

        if (comment && isMissingReleaseTag(comment)) {
          const variableName = utils.getExportName(node);
          context.report({
            loc: comment.loc,
            message: 'Missing release tag for {{ variableName }}',
            data: {
              variableName,
            },
            fix(fixer) {
              const value = addTagToComment(comment);
              return fixer.replaceTextRange(comment.range, value);
            },
          });
        }
      },
    };
  },
};

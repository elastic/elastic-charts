/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

const utils = require('./utils');

function fixLineComment({ range, value }) {
  return {
    value: `/**\n * ${value.trim()}\n */`,
    range,
  };
}

function fixBlockComment({ range, value }) {
  const content = value.trim();

  return {
    value: /\n/.test(value) ? `/**\n ${content}\n */` : `/**\n * ${content}\n */`,
    range,
  };
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
        const variableName = utils.getExportName(node);
        const comment = utils.getCommentBefore(context, node);

        if (!comment) {
          context.report({
            loc: node.loc,
            message: 'Missing TSDoc comment for {{ variableName }}',
            data: {
              variableName,
            },
            fix(fixer) {
              const value = `/**  */\n`;
              return fixer.insertTextBefore(node, value);
            },
          });
        } else {
          if (comment.type === 'Line') {
            context.report({
              loc: comment.loc,
              message: 'Use TSDoc comment for {{ variableName }}',
              data: {
                variableName,
              },
              fix(fixer) {
                const {
                  range: [rangeStart],
                  value,
                } = fixLineComment(comment);
                return fixer.replaceTextRange([rangeStart, node.range[0] - 1], value);
              },
            });
          } else {
            if (!comment.value.startsWith('*')) {
              context.report({
                loc: comment.loc,
                message: 'Comment is not TSDoc format for {{ variableName }}',
                data: {
                  variableName,
                },
                fix(fixer) {
                  const { range, value } = fixBlockComment(comment);
                  return fixer.replaceTextRange(range, value);
                },
              });
            }
          }
        }
      },
    };
  },
};

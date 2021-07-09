/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

const { INTERNAL_TAG, PUBLIC_TAG, ALPHA_TAG, BETA_TAG } = require('./constants');

const isTrailingCommentFn = (ctx) => (comment) => {
  if (comment.loc.start.column === 0) return false;
  const prev = ctx.getTokenBefore(comment);
  return Boolean(prev && prev.loc.end.line === comment.loc.start.line);
};

const specialComments = ['eslint-', '@ts-', 'http://www.apache.org', 'prettier-'];

function isSpecialComment({ value }) {
  return specialComments.some((sc) => value.includes(sc));
}

function getCommentBefore(context, node) {
  const isTrailingComment = isTrailingCommentFn(context);
  const [comment] = context.getCommentsBefore(node).reverse();

  if (!comment || isSpecialComment(comment) || isTrailingComment(comment)) {
    return null;
  }

  return comment;
}

function getTSDocComment(context, node) {
  const comment = getCommentBefore(context, node);
  return comment?.value?.startsWith?.('*') ? comment : null;
}

function getExportName(node) {
  if (node.exportKind === 'type') {
    return node.declaration?.id?.name ?? null;
  }

  return node.declaration?.declarations?.find?.(({ id }) => id.type === 'Identifier')?.id?.name ?? null;
}

function getReleaseTag(value) {
  return [INTERNAL_TAG, PUBLIC_TAG, ALPHA_TAG, BETA_TAG].find(
    (tag) => value.includes(`${tag}\n`) || value.includes(`${tag} `),
  );
}

module.exports = {
  getCommentBefore,
  getTSDocComment,
  getExportName,
  getReleaseTag,
};

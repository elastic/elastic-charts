/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

function generateMsg(key: string, body: string): string {
  return `<!-- comment-key: ${key} -->\n${body}`;
}

const reMsgKey = /^<!-- comment-key: (.+) -->/;
export function commentByKey<T extends keyof Comments>(key: T) {
  return (comment?: string): boolean => {
    if (!comment) return false;
    const [, commentKey] = reMsgKey.exec(comment) ?? [];
    return commentKey === key;
  };
}

export const comments = {
  communityPR() {
    return `Community pull request, @elastic/datavis please add the \`ci:approved ✅\` label to allow this and future builds.`;
  },
  deployment() {
    return ''; // needed for type lookup
  },
};

type Comments = typeof comments;

export function getComment<T extends keyof Comments>(key: T, ...args: Parameters<Comments[T]>): string {
  console.log(key, args);
  // @ts-ignore - conditional args
  const comment = comments[key](...args);
  return generateMsg(key, comment);
}

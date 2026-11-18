/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { ReactNode } from 'react';
import { createElement } from 'react';

import type { SvgNode } from './painter';

/**
 * Turns a recorded SVG tree into React elements. Groups that ended up empty (a save/restore
 * pair or a transform with nothing drawn inside) are dropped.
 * @internal
 */
export function svgNodesToReact(nodes: SvgNode[]): ReactNode[] {
  const elements: ReactNode[] = [];
  nodes.forEach((node, index) => {
    const children = node.children && node.children.length > 0 ? svgNodesToReact(node.children) : undefined;
    // a group left without content after pruning its own children draws nothing
    if (node.text === undefined && node.tag === 'g' && !children?.length) return;
    // the recorded sequence is the paint order, so its index is a stable key
    // eslint-disable-next-line react/no-array-index-key
    elements.push(createElement(node.tag, { key: index, ...node.attrs }, node.text ?? children));
  });
  return elements;
}

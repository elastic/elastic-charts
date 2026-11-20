/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { TextMeasure } from './canvas_text_bbox_calculator';
import { withTextMeasure } from './canvas_text_bbox_calculator';

const font = { fontFamily: 'Inter', fontStyle: 'normal', fontVariant: 'normal', fontWeight: 400 } as const;
const endOfTask = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

describe('withTextMeasure', () => {
  let contexts: Array<{ measureText: jest.Mock }>;
  let getContext: jest.SpyInstance;

  beforeEach(async () => {
    await endOfTask();
    contexts = [];
    getContext = jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => {
      const ctx = {
        font: '',
        textBaseline: 'alphabetic',
        save: jest.fn(),
        restore: jest.fn(),
        measureText: jest.fn((text: string) => ({ width: text.length * 10 })),
      };
      contexts.push(ctx);
      return ctx as unknown as CanvasRenderingContext2D;
    });
  });

  afterEach(() => getContext.mockRestore());

  it('measures on a canvas context shared by the layouts of a task', () => {
    const width = withTextMeasure((measure) => measure('Hello', font, 12).width);
    withTextMeasure((measure) => measure('b', font, 12));
    expect(width).toBe(50);
    expect(contexts).toHaveLength(1);
    expect(contexts[0]?.measureText.mock.calls).toEqual([['Hello'], ['b']]);
  });

  it('measures a kept measure on a new canvas context in a later task, so it keeps no canvas alive', async () => {
    let kept: TextMeasure | undefined;
    withTextMeasure((measure) => {
      kept = measure;
      measure('a', font, 12);
    });
    await endOfTask();
    expect(kept?.('Hello', font, 12)).toEqual({ width: 50, height: 12 });
    expect(contexts).toHaveLength(2);
    expect(contexts[1]?.measureText).toHaveBeenCalledWith('Hello');
  });
});

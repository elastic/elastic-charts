/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { configure } from 'enzyme';
import Adapter from '@cfaester/enzyme-adapter-react-18';

configure({ adapter: new Adapter() });

process.env.RNG_SEED = 'jest-unit-tests';

/**
 * Mocking RAF and ResizeObserver to missing RAF and RO in jsdom
 */
window.requestAnimationFrame = (callback) => {
  callback(0);
  return 0;
};

type ResizeObserverMockCallback = (entries: Array<{ contentRect: { width: number; height: number } }>) => void;
class ResizeObserverMock {
  callback: ResizeObserverMockCallback;

  constructor(callback: ResizeObserverMockCallback) {
    this.callback = callback;
  }

  observe() {
    this.callback([{ contentRect: { width: 200, height: 200 } }]);
  }

  unobserve() {}

  disconnect() {}
}

// @ts-ignore - setting mock override
window.ResizeObserver = ResizeObserverMock;

// Some tests will fail due to undefined Path2D, this mock doesn't create issues on test env
class Path2D {}
// @ts-ignore - setting mock override
window.Path2D = Path2D;

window.HTMLCanvasElement.prototype.getContext = jest.fn();

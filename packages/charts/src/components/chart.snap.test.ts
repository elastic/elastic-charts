/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Chart } from './chart';

describe('test getPNGSnapshot in Chart class', () => {
  jest.mock('../components/chart');
  it('should be called', () => {
    const chart = new Chart({});
    const spy = jest.spyOn(chart, 'getPNGSnapshot');
    chart.getPNGSnapshot({ backgroundColor: 'white' });

    expect(spy).toHaveBeenCalled();
  });
});

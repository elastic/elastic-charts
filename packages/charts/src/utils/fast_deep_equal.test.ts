/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { deepEqual } from './fast_deep_equal';

describe('deepEqual', () => {
  const a = {
    a: 'a',
    aa: {
      aa: 'aa',
    },
  };

  it('should match equal deep objects', () => {
    const result = deepEqual(a, {
      a: 'a',
      aa: {
        aa: 'aa',
      },
    });
    expect(result).toBeTrue();
  });

  it('should not match different deep objects', () => {
    const result = deepEqual(a, {
      a: 'a',
      aa: {
        aa: 'bb',
      },
    });
    expect(result).toBeFalse();
  });

  it('should not match partial deep objects with diffs', () => {
    const result = deepEqual(
      {
        aa: {
          aa: 'aa',
        },
      },
      a,
      false,
    );
    expect(result).toBeFalse();
  });

  it('should match only partial deep objects with diffs', () => {
    const result = deepEqual(
      {
        aa: {
          aa: 'aa',
        },
      },
      a,
      true,
    );
    expect(result).toBeTrue();
  });
});

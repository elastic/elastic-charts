/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

// Super flaky not sure why
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      /**
       * Node environment
       */
      NODE_ENV: 'development' | 'production' | 'test';
      /**
       * Port used for dev servers including:
       *  - storybook
       *  - playground
       */
      PORT?: string;
      /**
       * Timezone flag used on jest.ts.config.js
       */
      TZ: string;
      /**
       * Flag used to enable custom configuration under visual regression tests.
       *
       * Including:
       * - disabling animations
       * - preloading icons
       * - setting rng seed
       */
      VRT: string;
      /**
       * Flag used to connect an existing local server for visual regression tests.
       */
      LOCAL_VRT_SERVER: string;
      /**
       * Flag used to enable debug state on visual regression test runner
       */
      DEBUG: string;
      /**
       * String used for seeding a random number generator used in storybook and test files
       *
       * When seeded all rng use a deterministic random set of numbers.
       * When no seed is provided a positive _random_ number set will be used.
       */
      RNG_SEED: string;
    }
  }
}

export {}; // ensure this is parsed as a module.

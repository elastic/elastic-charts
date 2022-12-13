/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

export type Patterns = Array<string | RegExp>;

export interface Label {
  id?: number;
  name?: string;
  patterns: Patterns;
}

export interface User {
  id?: number;
  name: string;
  email: string;
}

export interface Env {
  repo: {
    repo: string;
    owner: string;
  };
  user: {
    bot: User;
  };
  branch: {
    /**
     * Targeted base branches to trigger builds
     */
    base: Patterns;
  };
  label: {
    buildkite: Label;
    skip: Label;
    ciApproved: Label;
  };
  commitPattern: {
    skip: Patterns;
    updateScreenshots: Patterns;
  };
}

const devEnv: Env = {
  repo: {
    owner: 'elastic',
    repo: 'datavis-ci-test',
  },
  user: {
    bot: {
      id: 107651659,
      name: 'elastic-datavis-test[bot]',
      email: '107651659+elastic-datavis-test[bot]@users.noreply.github.com',
    },
  },
  branch: {
    base: ['main', 'alpha', 'next', /\d+.\d+.\d+/, /\d+.\d+.x/, /\d+.x/, /buildkite-.+/],
  },
  label: {
    buildkite: {
      name: 'ci:buildkite',
      patterns: [],
    },
    skip: {
      patterns: ['ci:skip'],
    },
    ciApproved: {
      patterns: ['ci:approved ✅'],
    },
  },
  commitPattern: {
    skip: ['[skip-ci]', '[skip ci]', '[ci skip]', '[ci-skip]'],
    updateScreenshots: ['[update-vrt]', '[vrt-update]', '[update-screenshots]', '[screenshots-update]'],
  },
};

const prodEnv: Env = {
  repo: {
    owner: 'elastic',
    repo: 'elastic-charts',
  },
  user: {
    bot: {
      id: 98618603,
      name: 'elastic-datavis[bot]',
      email: '98618603+elastic-datavis[bot]@users.noreply.github.com',
    },
  },
  branch: {
    base: ['main', 'alpha', 'next', /\d+.\d+.\d+/, /\d+.\d+.x/, /\d+.x/],
  },
  label: {
    buildkite: {
      name: 'ci:buildkite',
      patterns: [],
    },
    skip: {
      patterns: ['ci:skip'],
    },
    ciApproved: {
      patterns: ['ci:approved ✅'],
    },
  },
  commitPattern: {
    skip: ['[skip-ci]', '[skip ci]', '[ci skip]', '[ci-skip]'],
    updateScreenshots: ['[update-vrt]', '[vrt-update]', '[update-screenshots]', '[screenshots-update]'],
  },
};

/**
 * Returns env config to test locally with test app and test repo
 */
export const getEnv = (isDev: boolean): Env => {
  return isDev ? devEnv : prodEnv;
};

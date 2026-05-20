/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Plugins } from './plugins';
import type { CommandStep, GroupStep } from '../../buildkite';
import { bkEnv } from '../buildkite';
import type { ChangeContext } from '../github';

export type CustomCommandStep = Omit<CommandStep, 'agents'> & {
  /**
   * Only applies to pull requests
   */
  skip?: CommandStep['skip'];
  /**
   * Ignores forced runs on non-pr branch runs, see below.
   * TODO: fix this to be accounted for in main logic
   */
  ignoreForced?: boolean;
  agents?: {
    imageProject?: 'elastic-images-qa' | 'elastic-images-prod' | string;
    image?: string;
    diskSizeGb?: number;
    provider?: 'gcp' | string;
    machineType?: string;
  };
};

export type CustomGroupStep = Omit<GroupStep, 'steps'> & {
  /** Whole group skip status */
  skip: boolean | string;
  /**
   * Ignores forced runs on non-pr branch runs, see below.
   * TODO: fix this to be accounted for in main logic
   */
  ignoreForced?: boolean;
  steps: [CustomCommandStep, ...CustomCommandStep[]];
};

// Only current supported steps
export type Step = CustomGroupStep | CustomCommandStep;

export const commandStepDefaults: Partial<CustomCommandStep> = {
  agents: {
    provider: 'gcp',
    image: 'family/elastic-charts-ubuntu-2404',
    imageProject: 'elastic-images-prod',
    machineType: 'n2-standard-2',
  },
  skip: false,
  priority: 10,
  plugins: [Plugins.docker.node()],
  timeout_in_minutes: 10,
  artifact_paths: ['.buildkite/artifacts/**/*.gz'],
};

export const createStep =
  <S extends Step>(getStep: (ctx: ChangeContext) => S) =>
  (overrides?: Partial<S>) =>
  (ctx: ChangeContext) => {
    const { skip, ignoreForced = false, ...step } = getStep(ctx);
    const forceRunStep = !ignoreForced && !bkEnv.isPullRequest;

    return {
      ...step,
      ...overrides,
      skip: forceRunStep ? false : skip ?? commandStepDefaults.skip ?? false,
    };
  };

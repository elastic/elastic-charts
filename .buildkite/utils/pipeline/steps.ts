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

/**
 * Available agents from kibana buildkite instance
 * See [full list](https://github.com/elastic/kibana-buildkite/blob/dab1058885036ac23e8371e40dcd3e0fedb4c49c/agents.json#L19-L165)
 */
export type AgentQueue =
  | 'default'
  | 'datavis-n2-2'
  | 'ci-group'
  | 'ci-group-4d'
  | 'ci-group-6'
  | 'jest'
  | 'n2-2'
  | 'n2-4'
  | 'c2-16'
  | 'c2-8'
  | 'c2-4';

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
    queue: AgentQueue;
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
    queue: 'datavis-n2-2' as AgentQueue,
  },
  skip: false,
  priority: 10,
  plugins: [Plugins.docker.node([], '20.11.1')],
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

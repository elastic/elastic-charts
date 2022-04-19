/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { CommandStep, GroupStep } from '../../buildkite';
import { ChangeContext } from '../github';
import { Plugins } from './plugins';

/**
 * Available agents from kibana buildkite instance
 * See [full list](https://github.com/elastic/kibana-buildkite/blob/dab1058885036ac23e8371e40dcd3e0fedb4c49c/agents.json#L19-L165)
 */
export type AgentQueue =
  | 'default'
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
  agents?: {
    queue: AgentQueue;
  };
};

export type CustomGroupStep = Omit<GroupStep, 'steps'> & {
  steps: CustomCommandStep[];
};

// Only current supported steps
export type Step = CustomGroupStep | CustomCommandStep;

export const commandStepDefaults: Partial<CustomCommandStep> = {
  agents: {
    queue: 'n2-2' as AgentQueue,
  },
  priority: 10,
  plugins: [Plugins.docker.node()],
  timeout_in_minutes: 10,
};

export const createStep =
  <S extends Step>(getStep: (ctx: ChangeContext) => S) =>
  (overrides?: Partial<S>) =>
  (ctx: ChangeContext) => {
    return {
      ...getStep(ctx),
      ...overrides,
    };
  };

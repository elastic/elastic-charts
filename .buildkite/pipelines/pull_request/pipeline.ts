/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { setMetadata } from 'buildkite-agent-node';
import { Required } from 'utility-types';

import type { JSONSchemaForBuildkitePipelineConfigurationFiles as BuildkitePipeline } from '../../buildkite.d';
import {
  apiCheckStep,
  ghpDeployStep,
  firebaseDeployStep,
  e2eServerStep,
  eslintStep,
  jestStep,
  playwrightStep,
  prettierStep,
  storybookStep,
  typeCheckStep,
} from '../../steps';
import {
  bkEnv,
  ChangeContext,
  createDeployment,
  uploadPipeline,
  createDeploymentStatus,
  Step,
  CustomCommandStep,
} from '../../utils';
import { getBuildConfig } from '../../utils/build';
import { MetaDataKeys } from '../../utils/constants';
import { updateCheckStatus } from './../../utils/github';

void (async () => {
  try {
    const pipeline: Required<BuildkitePipeline, 'steps'> = {
      steps: [],
    };

    const changeCtx = new ChangeContext();
    await changeCtx.init();

    // Update main job status
    await updateCheckStatus(
      {
        status: 'in_progress',
        details_url: bkEnv.buildUrl,
      },
      getBuildConfig().main.id,
    );

    const steps: Step[] = [
      jestStep(),
      eslintStep(),
      apiCheckStep(),
      prettierStep(),
      typeCheckStep(),
      storybookStep(),
      e2eServerStep(),
      ghpDeployStep(),
      playwrightStep(),
      firebaseDeployStep(),
    ].map((step) => step(changeCtx));

    await Promise.all(
      steps
        .map((step) => {
          const checkId = (
            'steps' in step ? step.steps.find((s) => s?.env?.ECH_CHECK_ID)?.env?.ECH_CHECK_ID : step?.env?.ECH_CHECK_ID
          ) as string | undefined;
          return { skip: step.skip, checkId };
        })
        .filter(({ checkId }) => Boolean(checkId))
        .map(({ skip, checkId }) => {
          if (skip) {
            return updateCheckStatus(
              {
                status: 'completed',
                conclusion: 'skipped',
                details_url: bkEnv.buildUrl,
              },
              checkId,
              skip,
            );
          }
        }),
    );

    const skipDeployStep = (steps.find(({ key }) => key === 'deploy_fb') as CustomCommandStep)?.skip ?? false;
    await setMetadata(MetaDataKeys.skipDeployment, skipDeployStep ? 'true' : 'false');
    if (!skipDeployStep) {
      console.log('DEPLOYYING');

      await createDeployment();
      await createDeploymentStatus({ state: 'queued' });
    } else {
      console.log('skipDeployStep', skipDeployStep);
      console.log(steps);
    }

    pipeline.steps = steps;
    await uploadPipeline(pipeline);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
})();

/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { setMetadata } from 'buildkite-agent-node';
import { Required } from 'utility-types';

import { JSONSchemaForBuildkitePipelineConfigurationFiles as BuildkitePipeline } from '../../buildkite.d';
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
  setStatus,
  uploadPipeline,
  createDeploymentStatus,
  Step,
  CustomCommandStep,
} from '../../utils';
import { MetaDataKeys } from '../../utils/constants';

const MAIN_CI_CONTEXT = '@elastic/datavis CI';

void (async () => {
  try {
    const pipeline: Required<BuildkitePipeline, 'steps'> = {
      steps: [],
    };

    const changeCtx = new ChangeContext();
    await changeCtx.init();

    // Set main job status
    await setStatus({
      context: MAIN_CI_CONTEXT,
      state: 'pending',
      target_url: bkEnv.buildUrl,
    });

    if (skipBuild()) {
      handleSkippedBuild();
      return;
    }

    const skipit = { skip: true };
    const steps: Step[] = [
      jestStep(skipit),
      eslintStep(skipit),
      apiCheckStep(skipit),
      prettierStep(skipit),
      typeCheckStep(skipit),
      storybookStep(skipit),
      e2eServerStep(),
      ghpDeployStep(skipit),
      playwrightStep(),
      firebaseDeployStep(skipit),
    ].map((step) => step(changeCtx));

    steps
      .map((step) => {
        const skip = 'steps' in step ? step.steps.every((s) => s.skip) : step.skip;
        const context = (
          'steps' in step ? step.steps.find((s) => s?.env?.ECH_CHECK_ID)?.env?.ECH_CHECK_ID : step?.env?.ECH_CHECK_ID
        ) as string | undefined;
        return { skip, context };
      })
      .filter(({ context }) => Boolean(context))
      .forEach(({ skip, context }) => {
        if (skip) {
          void setStatus({
            context,
            description: skip === true ? '[Skipped]' : `[Skipped] ${skip}`,
            state: 'success',
            target_url: bkEnv.buildUrl,
          });
        } else {
          void setStatus({
            context,
            state: 'pending',
            target_url: bkEnv.buildUrl,
          });
        }
      });

    const skipDeployStep = (steps.find(({ key }) => key === 'deploy_fb') as CustomCommandStep)?.skip ?? false;
    await setMetadata(MetaDataKeys.skipDeployment, skipDeployStep ? 'true' : 'false');
    if (!skipDeployStep) {
      console.log('DEPLOYYING');

      await createDeployment();
      await createDeploymentStatus({ state: 'queued' });
    }

    pipeline.steps = steps;

    uploadPipeline(pipeline);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
})();

function skipBuild() {
  if (process.env.BUILDKITE_BUILD_AUTHOR === 'elastic-charts-bot[bot]') {
    return true;
  }
}

function handleSkippedBuild() {
  // TODO
  console.log('handleSkippedBuild');
}

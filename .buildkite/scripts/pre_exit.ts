/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { execSync } from 'child_process';

import { yarnInstall } from './../utils/exec';
import { bkEnv, buildkiteGQLQuery, codeCheckIsCompleted, getJobMetadata, updateCheckStatus } from '../utils';

const skipChecks = new Set(['playwright_vrt', 'playwright_a11y']);

void (async function () {
  const { checkId, jobId, jobUrl } = bkEnv;

  if (checkId && jobId && !skipChecks.has(checkId)) {
    let root = process.cwd();
    try {
      root = execSync(`git rev-parse --show-toplevel`).toString().trim();
    } catch (error: unknown) {
      console.error(`Failed to get git root directory, falling back to current directory: ${process.cwd()}`, error);
    }
    const nodeModuleLsBefore = execSync(`ls -la ${root}/node_modules |  head -n 10`);
    console.log(`nodeModuleLsBefore: ${nodeModuleLsBefore}`);
    const ee = await yarnInstall().catch((error) => {
      console.error(`Failed to install dependencies`, error);
      return error;
    });
    const nodeModuleLsAfter = execSync(`ls -la ${root}/node_modules |  head -n 10`);
    console.log(`nodeModuleLsAfter: ${nodeModuleLsAfter}`);

    if (ee instanceof Error) {
      console.error(`Failed to install dependencies`);
      throw ee;
    }

    //     if (isFailedJob || !(await codeCheckIsCompleted())) {
    //       await updateCheckStatus(
    //         {
    //           status: 'completed',
    //           conclusion: isFailedJob ? 'failure' : 'success',
    //           details_url: jobUrl,
    //         },
    //         checkId,
    //       );
    //     }
    //   }
    // }
  }
})();

export interface Response {
  data: {
    job: {
      __typename: string;
      exitStatus: string;
      label: string;
      state: string;
      passed: boolean;
      canceledAt: string;
      events: {
        edges?:
          | {
              node: {
                type: string;
                timestamp: string;
                actor: {
                  type: string;
                  node: {
                    __typename: string;
                    name?: string | null;
                    bot?: boolean | null;
                  };
                };
              };
            }[]
          | null;
      };
    };
  };
}

function getCancelledBy(jobEvents: Response['data']['job']['events']) {
  const lastEvent = jobEvents.edges?.[0].node ?? null;
  if (lastEvent?.type !== 'CANCELATION') return null;
  return lastEvent.actor.type !== 'USER' ? null : lastEvent.actor.node.name ?? null;
}

async function getJobStatus(id: string) {
  try {
    const { data } = await buildkiteGQLQuery<Response>(`query getJobStatus {
      job(uuid: "${id}") {
        __typename
        ... on JobTypeCommand {
          exitStatus
          label
          state
          passed
          canceledAt
          events(last: 1) {
            edges {
              node {
                type
                timestamp
                actor {
                  type
                  node {
                    __typename
                    ... on User {
                      name
                      bot
                    }
                  }
                }
              }
            }
          }
        }
      }
    }`);

    return data.job.__typename === 'JobTypeCommand' ? data.job : null;
  } catch (error) {
    console.error(`Failed to get buildkite job status for jobId=${id}`);
    throw error;
  }
}

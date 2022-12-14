/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { bkEnv, buildkiteGQLQuery, codeCheckIsCompleted, getJobMetadata, updateCheckStatus } from '../utils';
import { yarnInstall } from './../utils/exec';

const skipChecks = new Set(['playwright']);

void (async function () {
  const { checkId, jobId, jobUrl } = bkEnv;

  if (checkId && jobId && !skipChecks.has(checkId)) {
    await yarnInstall();
    const jobStatus = await getJobStatus(jobId);

    if (jobStatus) {
      if (jobStatus.state === 'CANCELING') {
        const user = getCancelledBy(jobStatus.events ?? []);
        await updateCheckStatus(
          {
            status: 'completed',
            conclusion: 'cancelled',
            details_url: jobUrl,
          },
          checkId,
          user && `Cancelled by ${user}`,
        );
      } else {
        const isFailedJob = (await getJobMetadata('failed')) === 'true';

        if (isFailedJob || !(await codeCheckIsCompleted())) {
          await updateCheckStatus(
            {
              status: 'completed',
              conclusion: isFailedJob ? 'failure' : 'success',
              details_url: jobUrl,
            },
            checkId,
          );
        }
      }
    }
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

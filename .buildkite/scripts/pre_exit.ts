/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { bkEnv, buildkiteGQLQuery, codeCheckIsCompleted, getJobMetadata, updateCheckStatus } from '../utils';

void (async function () {
  const { checkId, jobId, jobUrl } = bkEnv;

  if (checkId && jobId) {
    const jobStatus = await getJobStatus(jobId);
    console.log(JSON.stringify(jobStatus, null, 2));

    if (jobStatus) {
      console.log('jobStatus.state:', jobStatus.state);

      if (jobStatus.state === 'CANCELING') {
        const user = getCancelledBy(jobStatus.events ?? []);
        console.log('updateCheckStatus - 1');
        await updateCheckStatus(
          {
            status: 'completed',
            conclusion: 'failure',
            details_url: jobUrl,
          },
          checkId,
          user && `Cancelled by ${user}`,
        );
      } else {
        console.log('else', await getJobMetadata('failed'));

        const isFailedJob = (await getJobMetadata('failed')) === 'true';
        console.log('isFailedJob', isFailedJob);
        console.log('codeCheckIsCompleted', !(await codeCheckIsCompleted()));

        if (isFailedJob || !(await codeCheckIsCompleted())) {
          console.log('updateCheckStatus - 2');

          await updateCheckStatus(
            {
              status: 'completed',
              conclusion: isFailedJob ? 'failure' : 'success',
              details_url: jobUrl,
            },
            checkId,
          );
        } else {
          console.log('not failed');
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
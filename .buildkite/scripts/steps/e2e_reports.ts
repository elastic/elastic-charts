/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import fs from 'fs';
import path from 'path';

import { InstallationAccessTokenAuthentication, InstallationAuthOptions } from '@octokit/auth-app';
import { setMetadata } from 'buildkite-agent-node';

import {
  bkEnv,
  exec,
  downloadArtifacts,
  getBuildJobs,
  startGroup,
  yarnInstall,
  compress,
  decompress,
  octokit,
  ScreenshotMeta,
  updateCheckStatus,
  jobStateMapping,
  JobState,
  defaultGHOptions,
  searchArtifacts,
} from '../../utils';

async function setGroupStatus() {
  const { checkId } = bkEnv;

  if (!checkId) {
    console.warn('Error: no checkId found, skipping e2e group status');
    return;
  }

  const e2eJobs = await getBuildJobs('playwright__parallel-step');
  const jobStateMap = new Map<string, number>();
  jobStateMap.set('Success', 0);
  jobStateMap.set('Failed', 0);

  const failedJobs = e2eJobs.filter((s) => !s.passed);
  e2eJobs.forEach(({ state, passed }) => {
    let key: string = jobStateMapping[state];
    if (state === JobState.Finished) {
      key = passed ? 'Success' : 'Failed';
    }
    const count = jobStateMap.get(key) ?? 0;
    jobStateMap.set(key, count + 1);
  });

  const summaryParts = [...jobStateMap.entries()].map(([key, n]) => `${n} ${key}`);
  const description = summaryParts.join(', ');

  await updateCheckStatus(
    {
      status: 'completed',
      conclusion: failedJobs.length > 0 ? 'failure' : 'success',
      // TODO improve this with detailed check output summary
      details_url: failedJobs.length === 1 ? failedJobs[0].url ?? bkEnv.buildUrl : bkEnv.buildUrl, // could set this to e2e-report
    },
    checkId,
    description,
  );
}

async function commitNewScreenshots() {
  startGroup('Committing updated screenshots from e2e jobs');
  await searchArtifacts('.buildkite/artifacts/screenshot_meta/*');
  await downloadArtifacts('.buildkite/artifacts/screenshot_meta/*');

  const screenshotMetaDir = '.buildkite/artifacts/screenshot_meta';
  const metaFiles = fs.readdirSync(screenshotMetaDir);
  const updatedFilePaths = metaFiles.sort().flatMap((f) => {
    const meta = JSON.parse(fs.readFileSync(path.join(screenshotMetaDir, f)).toString()) as ScreenshotMeta;
    return meta.files;
  });

  if (updatedFilePaths.length === 0) {
    console.log('No screenshots to be updated');
    return;
  }

  console.log(`Updating ${updatedFilePaths.length} screenshot${updatedFilePaths.length === 1 ? '' : 's'}:
  - ${updatedFilePaths.join('\n  - ')}`);

  await searchArtifacts('.buildkite/artifacts/screenshots/*');
  await downloadArtifacts('.buildkite/artifacts/screenshots/*');
  const screenshotDir = '.buildkite/artifacts/screenshots';
  const files = fs.readdirSync(screenshotDir);

  if (files.length === 0) {
    console.log('No updated screenshots to commit');
    return;
  }
  await Promise.all<void>(
    files.map((f) =>
      decompress({
        src: path.join(screenshotDir, f),
        dest: path.join('e2e/screenshots'),
      }),
    ),
  );
  await exec('git status');

  // TODO make this shared across GitHub bot app
  const botName = 'elastic-datavis[bot]';
  const botUid = 98618603;
  await exec(`git config user.name "${botName}"`);
  await exec(`git config user.email "${botUid}+${botName}@users.noreply.github.com"`);

  const { token } = (await octokit.auth({
    type: 'installation',
  } as InstallationAuthOptions)) as InstallationAccessTokenAuthentication;

  const remoteUrl = `https://${encodeURI(botName)}:${token}@github.com/${
    bkEnv.username ?? 'elastic'
  }/elastic-charts.git`;

  const message = `test(vrt): update screenshots [skip ci]`;
  await exec('git add e2e/screenshots');
  await exec(`git commit -m "${message}"`);
  await exec(`git push ${remoteUrl} HEAD:${bkEnv.branch}`); // HEAD:* required when detached from HEAD
  const previousCommitSha = await exec('git rev-parse --verify HEAD', {
    stdio: 'pipe',
  });
  // flags final build cleanup to sync checks on new commit
  await setMetadata('syncCommit', previousCommitSha.trim());
}

interface PRCommitResponse {
  repository: {
    pullRequest: {
      commits: {
        nodes: [
          {
            commit: {
              message: string;
              oid: string;
            };
          },
        ];
      };
    };
  };
}

export async function getLatestCommits(count = 2) {
  const { owner, repo } = defaultGHOptions;
  const response = await octokit.graphql<PRCommitResponse>(`query getLatestCommits {
    repository(owner: "${owner}", name: "${repo}") {
      pullRequest(number: ${bkEnv.pullRequestNumber!}) {
        commits(last: ${count}) {
          nodes {
            commit {
              message
              oid
            }
          }
        }
      }
    }
  }`);

  return response.repository.pullRequest.commits.nodes.map((n) => n.commit);
}

void (async () => {
  await yarnInstall('e2e');

  await setGroupStatus();

  await downloadArtifacts('.buildkite/artifacts/e2e_reports/*');

  const reportDir = '.buildkite/artifacts/e2e_reports';
  const files = fs.readdirSync(reportDir);
  await Promise.all<void>(
    files
      .filter((f) => f.startsWith('report_'))
      .map((f) =>
        decompress({
          src: path.join(reportDir, f),
          dest: path.join('e2e/reports', path.basename(f, '.gz')),
        }),
      ),
  );

  startGroup('Merging e2e reports');

  await exec('yarn merge:reports', {
    cwd: 'e2e',
    env: {
      HTML_REPORT_DIR: 'merged_html_report',
    },
  });

  await compress({
    src: 'e2e/merged_html_report',
    dest: '.buildkite/artifacts/merged_html_report.gz',
  });

  if (bkEnv.steps.playwright.updateScreenshots) {
    if (bkEnv.canModifyPR) {
      await commitNewScreenshots();
    } else {
      if (bkEnv.isPullRequest) {
        await octokit.issues.createComment({
          ...defaultGHOptions,
          issue_number: bkEnv.pullRequestNumber!,
          body: `Your latest commit indicated you would like me to update the vrt screenshots but this PR disallows edits. Please update your PR to allow edits and tell me to \`test this\` again.
          <img width="297" alt="image" src="https://user-images.githubusercontent.com/19007109/175552884-7f8e4bba-3440-444b-b19c-de15d618ac23.png">`,
        });
      }
    }
  }
})();

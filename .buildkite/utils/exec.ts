/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { execSync, ExecSyncOptionsWithBufferEncoding } from 'child_process';
import path from 'path';

import { setJobMetadata, bkEnv, getJobTimingStr, startGroup } from './buildkite';
import { setStatus } from './github';

interface ExecOptions extends ExecSyncOptionsWithBufferEncoding {
  input?: string;
  failureMsg?: string;
  onFailure?: () => Promise<void> | void;
  onSuccess?: () => Promise<void> | void;
  cwd?: string;
}

/**
 * Wrapper for execSync to catch and handle errors.
 * Runs commands from repo root directory.
 */
export const exec = (
  command: string,
  { input, cwd, failureMsg, onFailure, onSuccess, env, stdio = ['pipe', 'inherit', 'inherit'] }: ExecOptions = {},
) => {
  try {
    const result = execSync(command, {
      input,
      encoding: 'utf8',
      cwd: cwd && path.isAbsolute(cwd) ? cwd : path.resolve(__dirname, '../../', cwd ?? ''),
      stdio,
      env: {
        ...process.env,
        ...env,
      },
    });

    onSuccess?.();

    return result;
  } catch (error) {
    console.error(`Failed to run command: [${command}]`);
    void setJobMetadata('failed', 'true');
    onFailure?.();
    void setFailedStatus(failureMsg);

    throw error;
  }
};

export const yarnInstall = (cwd?: string) => {
  startGroup(`Installing node modules${cwd ? ` [${cwd}]` : ''}`);
  exec('yarn install --frozen-lockfile', { cwd });
};

async function setFailedStatus(failureMsg?: string) {
  if (bkEnv.context) {
    const description = failureMsg ?? `Failure in ${await getJobTimingStr()} - see logs...`;
    await setStatus({
      context: bkEnv.context,
      state: 'failure',
      target_url: bkEnv.jobUrl,
      description,
    });
  }
}

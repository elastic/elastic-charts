/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { execSync, ExecSyncOptionsWithBufferEncoding } from 'child_process';
import path from 'path';

import { setJobMetadata, startGroup } from './buildkite';
import { updateCheckStatus } from './github';

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
export const exec = async (
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
    await setJobMetadata('failed', 'true');
    await onFailure?.();
    await updateCheckStatus(
      {
        status: 'completed',
        conclusion: 'failure',
      },
      undefined,
      failureMsg,
    );

    throw error;
  }
};

export const yarnInstall = async (cwd?: string, ignoreScripts = true) => {
  startGroup(`Installing node modules${cwd ? ` [${cwd}]` : ''}`);
  const scriptFlag = ignoreScripts ? ' --ignore-scripts' : '';
  await exec(`yarn install --frozen-lockfile${scriptFlag}`, { cwd });
};

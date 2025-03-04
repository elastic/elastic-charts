/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { ExecSyncOptionsWithBufferEncoding } from 'child_process';
import { execSync } from 'child_process';
import path from 'path';

import { setJobMetadata, startGroup } from './buildkite';
import { updateCheckStatus } from './github';

interface ExecOptions extends ExecSyncOptionsWithBufferEncoding {
  /** arguments to appended to the command */
  args?: string;
  input?: string;
  failureMsg?: string;
  onFailure?: (err: { command: string; message: string }) => Promise<void> | void;
  onSuccess?: () => Promise<void> | void;
  cwd?: string;
  /**
   * Buildkite has network issues that require retrying
   */
  retry?: number;
  /**
   * Seconds to wait between retries
   */
  retryWait?: number;
  /**
   * Logic to run before next retry
   */
  onRetry?: () => void | Promise<void>;
  allowFailure?: boolean;
}

export const wait = (n: number) => new Promise((resolve) => setTimeout(resolve, n));

/**
 * Wrapper for execSync to catch and handle errors.
 * Runs commands from repo root directory.
 */
export const exec = async (
  command: string,
  {
    args = '',
    input,
    cwd,
    failureMsg,
    onFailure,
    onSuccess,
    env,
    stdio = ['pipe', 'inherit', 'inherit'],
    retry = 0,
    retryWait = 0,
    onRetry,
    allowFailure = false,
  }: ExecOptions = {},
): Promise<string> => {
  let retryCount = 0;
  async function execInner(): Promise<string> {
    try {
      const result = execSync([command, args].filter(Boolean).join(' '), {
        encoding: 'utf8',
        input,
        cwd: cwd && path.isAbsolute(cwd) ? cwd : path.resolve(__dirname, '../../', cwd ?? ''),
        stdio,
        env: {
          ...process.env,
          ...env,
        },
      });

      await onSuccess?.();

      return result;
    } catch (error) {
      if (retryCount < retry) {
        retryCount++;
        console.log(`⚠️  Failed to run command: [${command}], attempting retry ${retryCount} of ${retry}`);
        if (onRetry) await onRetry();
        if (retryWait) await wait(retryWait * 1000);
        return await execInner();
      }

      if (allowFailure) {
        throw error; // still need to catch
      }

      const errorMsg = getErrorMsg(error);
      console.error(`❌ Failed to run command: [${command}]`);

      await setJobMetadata('failed', 'true');
      await onFailure?.({ command, message: errorMsg });
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
  }
  return await execInner();
};

export const yarnInstall = async (cwd?: string, ignoreScripts = true) => {
  startGroup(`Installing node modules${cwd ? ` [${cwd}]` : ''}`);
  const scriptFlag = ignoreScripts ? ' --ignore-scripts' : '';
  await exec(`yarn install --frozen-lockfile${scriptFlag}`, { cwd, retry: 5, retryWait: 15 });
};

function getErrorMsg(error: unknown): string {
  const output: Array<string | null> = (error as any)?.output ?? [];
  if (output?.length > 0) {
    return output
      .filter(Boolean)
      .map((s) => s?.trim())
      .join('\n\n');
  }

  return error instanceof Error ? error.message : typeof error === 'string' ? error : '';
}

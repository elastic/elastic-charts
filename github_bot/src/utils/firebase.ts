/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

/**
 * Deletes deployment of a given PR channel
 */
export function deleteDeployment(pr: number) {
  try {
    const channelId = `pr-${pr}`;
    const gacFilePath = createGACFile();
    execSync(`npx firebase-tools@13.35.1 hosting:channel:delete ${channelId} --force`, {
      encoding: 'utf8',
      stdio: 'pipe',
      env: {
        ...process.env,
        GOOGLE_APPLICATION_CREDENTIALS: gacFilePath,
      } as any,
    });
  } catch (error) {
    // Nothing to do, likely auto-deleted past expiry
    console.error(error);
  }
}

// Set up Google Application Credentials for use by the Firebase CLI
// https://cloud.google.com/docs/authentication/production#finding_credentials_automatically
function createGACFile(): string {
  const gac = process.env.FIREBASE_AUTH;
  if (!gac) throw new Error('Error: unable to find FIREBASE_AUTH');

  const tmpdir = os.tmpdir();
  const filePath = path.join(tmpdir, 'gac.json');

  fs.writeFileSync(filePath, gac);

  return filePath;
}

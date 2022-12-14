/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import fs from 'fs';
import path from 'path';

import targz from 'targz';

/**
 * Returns a finite number or null
 */
export function getNumber(value?: string): number | null {
  if (!value) return null;
  const n = Number(value);
  return isNaN(n) ? null : n;
}

export const compress = (opts: targz.options) =>
  new Promise<void>((resolve, reject) => {
    console.log(`Compressing files in "${opts.src}"`);
    const destPath = path.dirname(opts.dest);
    fs.mkdirSync(destPath, { recursive: true });
    targz.compress(opts, function (err) {
      if (err) {
        reject(err);
      } else {
        console.log(`Compressed files successfully to "${opts.dest}"`);
        resolve();
      }
    });
  });

export const decompress = (opts: targz.options) =>
  new Promise<void>((resolve, reject) => {
    console.log(`Decompressing from "${opts.src}"`);
    const destPath = path.dirname(opts.dest);
    fs.mkdirSync(destPath, { recursive: true });
    targz.decompress(opts, function (err) {
      if (err) {
        reject(err);
      } else {
        // fs.rmSync(opts.src); // delete source to prevent uploading again
        console.log(`Decompressed files successfully to "${opts.dest}"`);
        resolve();
      }
    });
  });

/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '../dist');

function replaceInFile(filePath) {
  if (typeof filePath !== 'string') {
    throw new TypeError('filePath must be a string');
  }

  if (!fs.existsSync(filePath)) {
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  if (typeof content !== 'string') {
    throw new TypeError('content must be a string');
  }

  const originalContent = content;

  content = content.replaceAll(/ELASTIC_CHARTS_DEV_MODE\s*=\s*true/g, 'ELASTIC_CHARTS_DEV_MODE = false');
  content = content.replaceAll(
    /exports\.ELASTIC_CHARTS_DEV_MODE\s*=\s*true/g,
    'exports.ELASTIC_CHARTS_DEV_MODE = false',
  );
  content = content.replaceAll(
    /export\s+const\s+ELASTIC_CHARTS_DEV_MODE\s*=\s*true/g,
    'export const ELASTIC_CHARTS_DEV_MODE = false',
  );

  if (content !== originalContent) {
    try {
      fs.writeFileSync(filePath, content, 'utf8');
    } catch (error) {
      throw new Error(`Failed to write to file ${filePath}: ${error.message}`);
    }
  }

  return content !== originalContent;
}

function walkDir(dir, fileList = []) {
  if (typeof dir !== 'string') {
    throw new TypeError('dir must be a string');
  }

  if (!fs.existsSync(dir)) {
    throw new Error(`Directory ${dir} does not exist`);
  }

  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      walkDir(filePath, fileList);
    } else if (file.endsWith('.js')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

if (fs.existsSync(distPath)) {
  const jsFiles = walkDir(distPath);
  let replacedCount = 0;

  jsFiles.forEach((filePath) => {
    if (replaceInFile(filePath)) {
      replacedCount++;
    }
  });

  if (replacedCount > 0) {
    // eslint-disable-next-line no-console
    console.log(`Replaced ELASTIC_CHARTS_DEV_MODE constant in ${replacedCount} file(s)`);
  }
}

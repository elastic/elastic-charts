/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import fs from 'fs';
import path from 'path';

import axios from 'axios';
import { compile } from 'json-schema-to-typescript';

void (async function () {
  try {
    const { data: buildkiteSchema } = await axios(
      'https://raw.githubusercontent.com/buildkite/pipeline-schema/master/schema.json',
    );

    const typeContent = await compile(buildkiteSchema, 'buildkiteSchema');
    const filePath = path.resolve(__dirname, '../buildkite.d.ts');
    fs.writeFileSync(filePath, typeContent);
  } catch (error) {
    console.error(error);
  }
})();

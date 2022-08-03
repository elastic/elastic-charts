/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

const fs = require('fs');

const sassGraph = require('sass-graph');

const graph = sassGraph.parseFile('./src/components/_index.scss');

const root = Object.keys(graph.index)[0];

const content = recursiveReadSCSS(root, graph.index[root]);

fs.writeFileSync('./dist/theme.scss', content);

function recursiveReadSCSS(branchId, branch) {
  if (branch.imports.length === 0) {
    return fs.readFileSync(branchId, 'utf8');
  }
  const file = fs.readFileSync(branchId, 'utf8');
  const sassFileContent = [];
  branch.imports.forEach((branchImport) => {
    sassFileContent.push(recursiveReadSCSS(branchImport, graph.index[branchImport]));
  });
  // remove imports
  const contentWithoutImports = removeImportsFromFile(file);
  sassFileContent.push(contentWithoutImports);
  return sassFileContent.join('\n');
}

function removeImportsFromFile(fileContent) {
  const lines = fileContent.split(/\r\n|\r|\n/g);

  return lines.filter((line) => !/@import\s/i.test(line)).join('\n');
}

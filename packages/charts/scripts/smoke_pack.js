/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

const { execFileSync } = require('child_process');
const fs = require('fs');
const { createRequire } = require('module');
const os = require('os');
const path = require('path');

const chartsDir = path.resolve(__dirname, '..');
const repoRoot = path.resolve(chartsDir, '../..');
const repoNodeModules = path.join(repoRoot, 'node_modules');

const stylesheetExports = [
  '@elastic/charts/theme_light.css',
  '@elastic/charts/theme_dark.css',
  '@elastic/charts/theme_only_light.css',
  '@elastic/charts/theme_only_dark.css',
  '@elastic/charts/theme.scss',
  '@elastic/charts/dist/theme_light.css',
  '@elastic/charts/dist/theme_dark.css',
  '@elastic/charts/dist/theme_only_light.css',
  '@elastic/charts/dist/theme_only_dark.css',
  '@elastic/charts/dist/theme.scss',
  '@elastic/charts/dist/legacy/theme_light.css',
  '@elastic/charts/dist/legacy/theme_dark.css',
  '@elastic/charts/dist/legacy/theme_only_light.css',
  '@elastic/charts/dist/legacy/theme_only_dark.css',
];

function log(message) {
  // eslint-disable-next-line no-console
  console.log(message);
}

function fail(message) {
  throw new Error(message);
}

function assert(condition, message) {
  if (!condition) {
    fail(message);
  }
}

function packCharts() {
  const output = execFileSync('npm', ['pack', '--json'], {
    cwd: chartsDir,
    encoding: 'utf8',
  });
  const [result] = JSON.parse(output);
  if (!result?.filename) {
    fail('npm pack did not return a filename');
  }
  return path.join(chartsDir, result.filename);
}

function symlinkDep(consumerNodeModules, name) {
  const src = path.join(repoNodeModules, name);
  if (!fs.existsSync(src)) {
    fail(`Missing dependency in repo node_modules: ${name}`);
  }
  const dest = path.join(consumerNodeModules, name);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (!fs.existsSync(dest)) {
    fs.symlinkSync(src, dest);
  }
}

function setupConsumer(extractedPackage) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'elastic-charts-smoke-'));
  const consumer = path.join(tmp, 'consumer');
  const nodeModules = path.join(consumer, 'node_modules');
  const chartsDest = path.join(nodeModules, '@elastic', 'charts');

  fs.mkdirSync(path.dirname(chartsDest), { recursive: true });
  fs.cpSync(extractedPackage, chartsDest, { recursive: true });

  const pkg = JSON.parse(fs.readFileSync(path.join(chartsDest, 'package.json'), 'utf8'));
  const depNames = [...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.peerDependencies ?? {})];
  depNames.forEach((name) => {
    symlinkDep(nodeModules, name);
  });

  fs.writeFileSync(
    path.join(consumer, 'package.json'),
    `${JSON.stringify({ name: 'elastic-charts-smoke', private: true }, null, 2)}\n`,
  );

  return { tmp, consumer, chartsDest };
}

function writeProbe(consumer, filename, contents) {
  const probePath = path.join(consumer, filename);
  fs.writeFileSync(probePath, contents);
  return probePath;
}

function main() {
  const distCss = path.join(chartsDir, 'dist/theme_light.css');
  const distCjs = path.join(chartsDir, 'dist/cjs/index.js');
  const distEsm = path.join(chartsDir, 'dist/esm/index.mjs');
  if (!fs.existsSync(distCss) || !fs.existsSync(distCjs) || !fs.existsSync(distEsm)) {
    fail('Built package output is missing. Run `yarn build` in packages/charts before `yarn test:pack`.');
  }

  const tarballFlagIndex = process.argv.indexOf('--tarball');
  const packedHere = tarballFlagIndex === -1;
  const tarball = packedHere ? packCharts() : path.resolve(process.argv[tarballFlagIndex + 1]);
  if (!fs.existsSync(tarball)) {
    fail(`Tarball not found: ${tarball}`);
  }

  const extractRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'elastic-charts-pack-'));
  execFileSync('tar', ['-xzf', tarball, '-C', extractRoot]);
  const extracted = path.join(extractRoot, 'package');
  const { tmp, consumer } = setupConsumer(extracted);

  try {
    const requireFromConsumer = createRequire(path.join(consumer, 'package.json'));
    const resolvedEntry = requireFromConsumer.resolve('@elastic/charts');
    assert(
      resolvedEntry.replaceAll('\\', '/').endsWith('/dist/cjs/index.js'),
      `CJS resolve expected dist/cjs/index.js, got ${resolvedEntry}`,
    );

    stylesheetExports.forEach((specifier) => {
      requireFromConsumer.resolve(specifier);
    });

    let srcPublished = true;
    try {
      requireFromConsumer.resolve('@elastic/charts/src/index.ts');
    } catch {
      srcPublished = false;
    }
    assert(!srcPublished, 'Packed package must not export ./src');

    writeProbe(
      consumer,
      'probe.mjs',
      `import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const resolved = require.resolve('@elastic/charts');
if (!resolved.replaceAll('\\\\', '/').endsWith('/dist/cjs/index.js')) {
  throw new Error(\`import.meta consumer resolved CJS unexpectedly: \${resolved}\`);
}

const esmEntry = await import.meta.resolve('@elastic/charts');
if (!esmEntry.replaceAll('\\\\', '/').endsWith('/dist/esm/index.mjs')) {
  throw new Error(\`ESM resolve expected dist/esm/index.mjs, got \${esmEntry}\`);
}

const chartsRoot = join(dirname(fileURLToPath(import.meta.url)), 'node_modules/@elastic/charts');
const { WeightFn } = await import(
  pathToFileURL(join(chartsRoot, 'dist/esm/chart_types/wordcloud/layout/types/viewmodel_types.mjs')).href
);
const { MetricTrendShape } = await import(
  pathToFileURL(join(chartsRoot, 'dist/esm/chart_types/metric/specs/index.mjs')).href
);
if (WeightFn.exponential !== 'exponential') throw new Error('WeightFn.exponential missing from ESM build');
if (MetricTrendShape.Bars !== 'bars') throw new Error('MetricTrendShape.Bars missing from ESM build');

const wordcloudSpecs = await import(
  pathToFileURL(join(chartsRoot, 'dist/esm/chart_types/wordcloud/specs/index.mjs')).href
);
if (wordcloudSpecs.WeightFn !== WeightFn) throw new Error('WeightFn is not a value re-export from wordcloud specs');
`,
    );
    execFileSync(process.execPath, ['probe.mjs'], { cwd: consumer, stdio: 'inherit' });

    const requireWeightFn = requireFromConsumer(
      path.join(
        consumer,
        'node_modules/@elastic/charts/dist/cjs/chart_types/wordcloud/layout/types/viewmodel_types.js',
      ),
    );
    const requireMetric = requireFromConsumer(
      path.join(consumer, 'node_modules/@elastic/charts/dist/cjs/chart_types/metric/specs/index.js'),
    );
    const requireWordcloudSpecs = requireFromConsumer(
      path.join(consumer, 'node_modules/@elastic/charts/dist/cjs/chart_types/wordcloud/specs/index.js'),
    );
    assert(requireWeightFn.WeightFn?.exponential === 'exponential', 'WeightFn.exponential missing from CJS build');
    assert(requireMetric.MetricTrendShape?.Bars === 'bars', 'MetricTrendShape.Bars missing from CJS build');
    assert(
      requireWordcloudSpecs.WeightFn === requireWeightFn.WeightFn,
      'WeightFn is not a value re-export from CJS wordcloud specs',
    );

    log('Packed package smoke test passed.');
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
    fs.rmSync(extractRoot, { recursive: true, force: true });
    if (packedHere) {
      fs.rmSync(tarball, { force: true });
    }
  }
}

main();

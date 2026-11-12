/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/* eslint-disable no-console */

/**
 * Renders every storybook story to a standalone SVG in Node, with `renderChartToSVGString` and no browser,
 * and compares it with the story's VRT baseline.
 *
 *   yarn node-svg:review [--filter <substring>] [--font-dir <dir>] [--skip-build] [image-distance options]
 *
 * Each story is rendered at the size of its baseline screenshot and rasterized with resvg. The SVG and PNG
 * are written to e2e/screenshots_node_svg, laid out like e2e/screenshots, then `image-distance --cross`
 * compares them with the baselines; options it knows (`--page`, `--open`, `--sheet N`, `--top N`,
 * `--threshold`) are passed on. Stories that throw are listed with their error.
 *
 * Text is measured and rasterized with the fonts Chrome uses in the Playwright image the baselines are taken
 * in: the Liberation fonts, standing in for Helvetica, Arial, Times and Courier. They are downloaded once to
 * e2e/.cache/fonts. `--font-dir` uses the `.ttf`, `.otf` and `.ttc` files of another directory instead.
 * `--skip-build` reuses the bundle of the previous run.
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { Resvg } from '@resvg/resvg-js';
import { paramCase } from 'change-case';
import { PNG } from 'pngjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SERVER_DIR = path.join(ROOT, 'e2e_server/server');
const TMP_DIR = path.join(ROOT, 'e2e_server/tmp');
const BUNDLE_DIR = path.join(ROOT, 'e2e_server/.out_node_svg');
const BASELINE_DIR = path.join(ROOT, 'e2e/screenshots/all.test.ts-snapshots/baselines');
const OUT_REL = 'e2e/screenshots_node_svg';
const OUT_DIR = path.join(ROOT, OUT_REL, 'all.test.ts-snapshots/baselines');
const REPORT = path.join(ROOT, 'e2e/reports/node_svg_vrt.json');
const SUFFIX = '-chrome-linux.png';
const FONT_CACHE_DIR = path.join(ROOT, 'e2e/.cache/fonts');
const LIBERATION_URL =
  'https://github.com/liberationfonts/liberation-fonts/files/7261482/liberation-fonts-ttf-2.1.5.tar.gz';

function getArgs() {
  const args = process.argv.slice(2);
  const take = (name) => {
    const index = args.indexOf(`--${name}`);
    if (index === -1) return undefined;
    const [, value] = args.splice(index, 2);
    return value;
  };
  const flag = (name) => {
    const index = args.indexOf(`--${name}`);
    if (index !== -1) args.splice(index, 1);
    return index !== -1;
  };
  return {
    filter: (take('filter') ?? '').toLowerCase(),
    fontDir: take('font-dir'),
    skipBuild: flag('skip-build'),
    imageDistanceArgs: args,
  };
}

/** the story list of the VRT server, then an entry exporting a loader per story */
function writeEntry() {
  execFileSync('node', ['e2e_server/server/generate/extract_examples.js'], { cwd: ROOT, stdio: 'inherit' });
  const groups = JSON.parse(fs.readFileSync(path.join(TMP_DIR, 'examples.json'), 'utf8'));
  const stories = groups.flatMap(({ slugifiedGroupTitle, exampleFiles }) =>
    exampleFiles.map(({ name, filePath }) => ({ group: slugifiedGroupTitle, name: paramCase(name), filePath })),
  );
  const entry = `export { renderStory } from '../server/node_svg/render_story';
export { registerFont } from '@elastic/charts/src/server';

export const stories = [
${stories
  .map(
    ({ group, name, filePath }) => `  { group: '${group}', name: '${name}', load: () => import('../../${filePath}') },`,
  )
  .join('\n')}
];
`;
  fs.writeFileSync(path.join(TMP_DIR, 'node_svg_entry.tsx'), entry);
}

/** the stories bundled for Node with the VRT server's aliases and story mocks */
async function build() {
  const { createRsbuild } = await import('@rsbuild/core');
  const { pluginReact } = await import('@rsbuild/plugin-react');
  const { pluginSass } = await import('@rsbuild/plugin-sass');
  const chartsSrc = path.join(ROOT, 'packages/charts/src');
  const rsbuild = await createRsbuild({
    cwd: SERVER_DIR,
    rsbuildConfig: {
      logLevel: 'warn',
      plugins: [
        pluginReact({ swcReactOptions: { runtime: 'classic' } }),
        pluginSass({
          sassLoaderOptions: {
            sassOptions: {
              loadPaths: [ROOT],
              quietDeps: true,
              silenceDeprecations: ['import', 'global-builtin', 'slash-div', 'color-functions'],
            },
          },
        }),
      ],
      source: {
        entry: { index: '../tmp/node_svg_entry.tsx' },
        tsconfigPath: './tsconfig.json',
        define: {
          'process.env.RNG_SEED': JSON.stringify('elastic-charts'),
          'process.env.VRT': JSON.stringify('true'),
        },
      },
      resolve: {
        aliasStrategy: 'prefer-alias',
        alias: {
          '@storybook/addon-knobs': path.join(SERVER_DIR, 'mocks/@storybook/addon-knobs'),
          '@storybook/addon-actions': path.join(SERVER_DIR, 'mocks/@storybook/addon-actions'),
          '@elastic/charts$': chartsSrc,
          '@elastic/charts/src': chartsSrc,
          // the es build, as in the browser, so that deep imports share its modules (the icon cache)
          '@elastic/eui$': path.join(ROOT, 'node_modules/@elastic/eui/es/index.js'),
        },
      },
      output: {
        target: 'node',
        distPath: { root: BUNDLE_DIR },
        filename: { js: '[name].mjs' },
        cleanDistPath: true,
        minify: false,
        sourceMap: false,
      },
      performance: { chunkSplit: { strategy: 'all-in-one' } },
    },
  });
  await rsbuild.build();
}

/** the Liberation fonts, which Chrome in the Playwright image draws Helvetica, Arial, Times and Courier with */
async function liberationFonts() {
  const dir = path.join(FONT_CACHE_DIR, path.basename(LIBERATION_URL, '.tar.gz'));
  if (!fs.existsSync(dir)) {
    console.log(`downloading the Liberation fonts to ${path.relative(ROOT, FONT_CACHE_DIR)}`);
    fs.mkdirSync(FONT_CACHE_DIR, { recursive: true });
    const archive = path.join(FONT_CACHE_DIR, 'liberation.tar.gz');
    fs.writeFileSync(archive, Buffer.from(await (await fetch(LIBERATION_URL)).arrayBuffer()));
    execFileSync('tar', ['xzf', archive, '-C', FONT_CACHE_DIR]);
    fs.rmSync(archive);
  }
  return dir;
}

/** the fontconfig aliases of the Playwright image: the metric compatible Liberation fonts stand in for the core fonts */
const LIBERATION_ALIASES = [
  [/^LiberationSans-/, { aliases: ['Helvetica', 'Arial'], generic: 'sans-serif' }],
  [/^LiberationSerif-/, { aliases: ['Times', 'Times New Roman'], generic: 'serif' }],
  [/^LiberationMono-/, { aliases: ['Courier', 'Courier New'], generic: 'monospace' }],
];

/** every font file of a directory, registered for text measurement inside the bundle */
function registerFonts(registerFont, fontDir) {
  const files = fs
    .readdirSync(fontDir)
    .filter((file) => /\.(ttf|otf|ttc)$/i.test(file))
    .map((file) => path.join(fontDir, file));
  for (const file of files) {
    const options = LIBERATION_ALIASES.find(([pattern]) => pattern.test(path.basename(file)))?.[1] ?? {};
    registerFont(fs.readFileSync(file), options);
  }
  return files;
}

/** rasterized with the fonts the text was measured with, and no others */
function rasterize(svg, fontFiles) {
  const resvg = new Resvg(svg, {
    background: '#fff',
    font: {
      loadSystemFonts: false,
      fontFiles,
      defaultFontFamily: 'Liberation Sans',
      sansSerifFamily: 'Liberation Sans',
      serifFamily: 'Liberation Serif',
      monospaceFamily: 'Liberation Mono',
    },
  });
  return resvg.render().asPng();
}

async function renderAll({ filter, fontDir }) {
  const bundle = await import(pathToFileURL(path.join(BUNDLE_DIR, 'index.mjs')).href);
  const { stories, renderStory } = bundle;
  const fontFiles = registerFonts(bundle.registerFont, fontDir ?? (await liberationFonts()));
  // a filtered run refreshes its stories and keeps the others
  if (!filter) fs.rmSync(path.join(ROOT, OUT_REL), { recursive: true, force: true });

  const results = [];
  const selected = stories.filter(({ group, name }) => `${group}/${name}`.includes(filter));
  for (const { group, name, load } of selected) {
    const baseline = path.join(BASELINE_DIR, group, `${name}${SUFFIX}`);
    if (!fs.existsSync(baseline)) continue;
    const { width, height } = PNG.sync.read(fs.readFileSync(baseline));
    const out = path.join(OUT_DIR, group, `${name}${SUFFIX}`);
    const started = performance.now();
    try {
      const svg = await renderStory(load, { width, height });
      fs.mkdirSync(path.dirname(out), { recursive: true });
      fs.writeFileSync(out.replace(/\.png$/, '.svg'), svg);
      fs.writeFileSync(out, rasterize(svg, fontFiles));
      results.push({ story: `${group}/${name}`, ms: Math.round(performance.now() - started) });
    } catch (error) {
      results.push({ story: `${group}/${name}`, error: String(error?.message ?? error).split('\n')[0] });
    }
  }
  return results;
}

async function main() {
  const options = getArgs();
  if (!options.skipBuild) {
    writeEntry();
    await build();
  }
  const results = await renderAll(options);
  const failed = results.filter(({ error }) => error);
  fs.mkdirSync(path.dirname(REPORT), { recursive: true });
  fs.writeFileSync(REPORT, JSON.stringify(results, null, 2));

  console.log(`\nrendered ${results.length - failed.length} of ${results.length} stories with a baseline`);
  if (failed.length > 0) {
    console.log(`\n${failed.length} stories threw:`);
    failed.forEach(({ story, error }) => console.log(`  ${story}: ${error}`));
  }
  console.log(`\nsvg and png per story: ${OUT_REL}, run log: ${path.relative(ROOT, REPORT)}\n`);

  execFileSync('yarn', ['-s', 'image-distance', '--cross', '--svg-dir', OUT_REL, ...options.imageDistanceArgs], {
    cwd: path.join(ROOT, 'e2e'),
    stdio: 'inherit',
  });
}

await main();

/* eslint-enable no-console */

/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/* eslint-disable no-console */

/**
 * Reports how far screenshots are from a reference, as differing pixel counts, so that most image pairs
 * need no looking at.
 *
 *   yarn image-distance [--cross] [--threshold 0.3] [--top N] [--filter <substring>] [--exclude <a,b>]
 *                       [--sheet N] [--scale 1] [--page] [--open]
 *
 * Without `--cross`: every changed PNG under e2e/screenshots against its committed version, e.g. after a
 * `yarn test -u` run (modified files are compared, untracked ones listed as new).
 * With `--cross`: every svg screenshot in e2e/screenshots_svg (untracked, written by
 * `yarn test --renderer=svg -u`) against the canvas baseline of the same story in e2e/screenshots.
 *
 * The distance of a pair is its count of differing pixels; the ratio is that count over the area of the
 * chart screenshot, so stories of different sizes compare.
 *
 * `--filter` keeps the stories whose path contains the substring, `--exclude` drops those containing any of
 * the comma separated substrings (both case-insensitive).
 * `--sheet N` writes a contact sheet of the N worst stories (expected | actual | diff per row) to
 * e2e/reports/image_distance_sheet.png, `--scale` downsamples it by nearest neighbour.
 * `--page` writes a web page of every compared story, worst first, each with its canvas and svg
 * screenshots and the diff between them, to e2e/reports/image_distance/index.html; `--open` then opens it in the
 * default browser.
 */

import { execFileSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

const E2E_DIR = 'e2e';
const CANVAS_DIR = 'e2e/screenshots';
const SVG_DIR = 'e2e/screenshots_svg';
const SHEET_PATH = 'e2e/reports/image_distance_sheet.png';
const PAGE_DIR = 'e2e/reports/image_distance';
const GAP = 4;
/** fills the area a smaller image lacks when sizes differ, so that area counts as different */
const SENTINEL = [255, 0, 255, 255];
const DIFF_COLOR = [255, 0, 0, 255]; // pixelmatch's default color of a counted differing pixel

interface Row {
  file: string;
  status: 'modified' | 'new';
  diff: number;
  total: number;
  /** differing pixels over all pixels, as a percentage */
  ratio: number;
  bbox: string;
  note: string;
}

type PairReader = (file: string) => [expected: PNG, actual: PNG];

function getArgs() {
  const args = process.argv.slice(2);
  const get = (name: string): string | undefined => {
    const index = args.findIndex((arg) => arg === `--${name}` || arg.startsWith(`--${name}=`));
    if (index === -1) return undefined;
    return args[index]!.includes('=') ? args[index]!.slice(name.length + 3) : args[index + 1];
  };
  const num = (name: string, fallback: number) => (get(name) === undefined ? fallback : Number(get(name)));
  return {
    cross: args.includes('--cross'),
    threshold: num('threshold', 0.3),
    top: num('top', Infinity),
    filter: (get('filter') ?? '').toLowerCase(),
    exclude: (get('exclude') ?? '').toLowerCase().split(',').filter(Boolean),
    sheet: num('sheet', 0),
    scale: num('scale', 1),
    page: args.includes('--page'),
    open: args.includes('--open'),
  };
}

function git(root: string, args: string[]): Buffer {
  return execFileSync('git', ['-C', root, ...args], {
    maxBuffer: 256 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'inherit'],
  });
}

function gitLines(root: string, args: string[]): string[] {
  return git(root, args)
    .toString()
    .split('\n')
    .filter((line) => line.endsWith('.png'));
}

function pad(image: PNG, width: number, height: number): PNG {
  if (image.width === width && image.height === height) return image;
  const padded = new PNG({ width, height });
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const inside = x < image.width && y < image.height;
      const source = inside ? image.data.subarray((y * image.width + x) * 4, (y * image.width + x) * 4 + 4) : SENTINEL;
      padded.data.set(source, (y * width + x) * 4);
    }
  }
  return padded;
}

function compare(expected: PNG, actual: PNG, threshold: number) {
  const width = Math.max(expected.width, actual.width);
  const height = Math.max(expected.height, actual.height);
  // expected | actual | diff, all of the larger size
  const images: [PNG, PNG, PNG] = [
    pad(expected, width, height),
    pad(actual, width, height),
    new PNG({ width, height }),
  ];
  const [a, b, diffImage] = images;
  const diff = pixelmatch(a.data, b.data, diffImage.data, width, height, { threshold, includeAA: false });
  // bounding box of the counted pixels: exactly the ones pixelmatch painted in DIFF_COLOR
  let [x0, y0, x1, y1] = [width, height, -1, -1];
  for (let i = 0; i < width * height; i++) {
    if (DIFF_COLOR.every((c, k) => diffImage.data[i * 4 + k] === c)) {
      const [x, y] = [i % width, Math.floor(i / width)];
      [x0, y0, x1, y1] = [Math.min(x0, x), Math.min(y0, y), Math.max(x1, x), Math.max(y1, y)];
    }
  }
  const sizeMismatch = expected.width !== actual.width || expected.height !== actual.height;
  return {
    diff,
    total: width * height,
    ratio: (diff / (width * height)) * 100,
    bbox: diff > 0 ? `${x0},${y0}-${x1},${y1}` : '',
    note: sizeMismatch ? `size mismatch ${expected.width}x${expected.height} vs ${actual.width}x${actual.height}` : '',
    images,
  };
}

/** the committed version of a file against its working copy */
const committedPair =
  (root: string): PairReader =>
  (file) => [PNG.sync.read(git(root, ['show', `HEAD:${file}`])), PNG.sync.read(fs.readFileSync(path.join(root, file)))];

/** the canvas baseline of a story against its svg baseline, both from the working tree */
const crossPair =
  (root: string): PairReader =>
  (file) => [
    PNG.sync.read(fs.readFileSync(path.join(root, CANVAS_DIR, path.relative(SVG_DIR, file)))),
    PNG.sync.read(fs.readFileSync(path.join(root, file))),
  ];

function writeSheet(root: string, rows: Row[], readPair: PairReader, threshold: number, scale: number) {
  const panels = rows.map(({ file }) => compare(...readPair(file), threshold).images);
  const width = Math.max(...panels.map(([image]) => image.width * 3 + GAP * 2));
  const height = panels.reduce((sum, [image]) => sum + image.height, 0) + GAP * (panels.length - 1);
  const sheet = new PNG({ width, height });
  sheet.data.fill(128); // gray gaps
  let top = 0;
  panels.forEach((images) => {
    images.forEach((image, column) => {
      const left = column * (image.width + GAP);
      for (let y = 0; y < image.height; y++) {
        sheet.data.set(
          image.data.subarray(y * image.width * 4, (y + 1) * image.width * 4),
          ((top + y) * width + left) * 4,
        );
      }
    });
    top += images[0].height + GAP;
  });
  const out = scale === 1 ? sheet : new PNG({ width: Math.floor(width * scale), height: Math.floor(height * scale) });
  if (scale !== 1) {
    for (let y = 0; y < out.height; y++) {
      for (let x = 0; x < out.width; x++) {
        const source = (Math.floor(y / scale) * width + Math.floor(x / scale)) * 4;
        out.data.set(sheet.data.subarray(source, source + 4), (y * out.width + x) * 4);
      }
    }
  }
  fs.mkdirSync(path.dirname(path.join(root, SHEET_PATH)), { recursive: true });
  fs.writeFileSync(path.join(root, SHEET_PATH), PNG.sync.write(out));
  console.log(`\ncontact sheet (expected | actual | diff per row, ${out.width}x${out.height}): ${SHEET_PATH}`);
  rows.forEach(({ file }, i) => console.log(`  row ${i + 1}: ${path.relative(E2E_DIR, file)}`));
}

const escapeHtml = (text: string) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

/**
 * A tall page of every compared story, worst first: the expected and actual screenshots side by side
 * with the diff between them, so a reviewer scrolls from the stories that need a look to the ones that
 * do not. The diff images are written next to the page; the screenshots are linked where they are.
 */
function writePage(root: string, rows: Row[], newRows: Row[], readPair: PairReader, threshold: number, cross: boolean) {
  const pageDir = path.join(root, PAGE_DIR);
  const diffDir = path.join(pageDir, 'diff');
  fs.rmSync(diffDir, { recursive: true, force: true });
  fs.mkdirSync(diffDir, { recursive: true });
  const [expectedLabel, actualLabel] = cross ? ['canvas', 'svg'] : ['committed', 'working tree'];
  const href = (file: string) => path.relative(pageDir, path.join(root, file)).split(path.sep).join('/');
  const sections = rows.map(({ file, diff, total, ratio, bbox, note }, index) => {
    const [expected, actual] = readPair(file);
    const diffFile = path.join(diffDir, `${file.replaceAll(/[^\w.-]+/g, '_')}`);
    fs.writeFileSync(diffFile, PNG.sync.write(compare(expected, actual, threshold).images[2]));
    const expectedFile = cross ? path.join(CANVAS_DIR, path.relative(SVG_DIR, file)) : file;
    const story = escapeHtml(path.relative(E2E_DIR, file));
    const images = [
      [
        expectedLabel,
        cross || diff === 0
          ? href(expectedFile)
          : `data:image/png;base64,${PNG.sync.write(expected).toString('base64')}`,
      ],
      [actualLabel, href(file)],
      ['diff', href(path.relative(root, diffFile))],
    ];
    return `<section>
  <h2><span class="ratio">${ratio.toFixed(3)}%</span> ${diff.toLocaleString()} of ${total.toLocaleString()} px
    <span class="meta">${bbox ? `bbox ${bbox}` : ''} ${escapeHtml(note)}</span></h2>
  <p class="story">${index + 1}. ${story}</p>
  <div class="images">${images
    .map(
      ([label, src]) =>
        `<figure><figcaption>${label}</figcaption><img loading="lazy" src="${src}" alt="${label}"></figure>`,
    )
    .join('')}</div>
</section>`;
  });
  const buckets = [
    ['identical', rows.filter((r) => r.ratio === 0).length],
    ['under 0.1%', rows.filter((r) => r.ratio > 0 && r.ratio < 0.1).length],
    ['0.1% to 1%', rows.filter((r) => r.ratio >= 0.1 && r.ratio < 1).length],
    ['1% to 5%', rows.filter((r) => r.ratio >= 1 && r.ratio < 5).length],
    ['5% and over', rows.filter((r) => r.ratio >= 5).length],
  ];
  const html = `<!doctype html>
<meta charset="utf-8">
<title>image distance: ${cross ? 'svg vs canvas' : 'changed screenshots'}</title>
<style>
  body { font: 14px/1.4 system-ui, sans-serif; margin: 0 16px 48px; color: #222; }
  h1 { font-size: 20px; margin: 24px 0 4px; }
  .summary { color: #555; margin: 0 0 24px; }
  section { border-top: 1px solid #ddd; padding: 12px 0 20px; }
  h2 { font-size: 15px; margin: 0; }
  .ratio { display: inline-block; min-width: 5em; font-variant-numeric: tabular-nums; }
  .meta { color: #777; font-weight: normal; margin-left: 1em; }
  .story { color: #555; margin: 2px 0 8px; font-family: ui-monospace, monospace; font-size: 12px; }
  .images { display: flex; gap: 8px; }
  figure { flex: 1 1 0; margin: 0; min-width: 0; }
  figcaption { color: #777; font-size: 12px; margin-bottom: 2px; }
  img { max-width: 100%; height: auto; display: block; background: #fff; box-shadow: 0 0 0 1px #ddd; }
  .new { color: #555; font-family: ui-monospace, monospace; font-size: 12px; }
</style>
<h1>Image distance: ${cross ? 'svg screenshots vs canvas baselines' : 'changed screenshots vs committed'}</h1>
<p class="summary">${rows.length} stories, worst first, by differing pixels over the chart area
  (pixelmatch threshold ${threshold}): ${buckets.map(([label, count]) => `${label}: ${count}`).join(' · ')}.</p>
${sections.join('\n')}
${newRows.length > 0 ? `<section><h2>${cross ? 'No canvas baseline' : 'New'}</h2>${newRows.map(({ file }) => `<p class="new">${escapeHtml(path.relative(E2E_DIR, file))}</p>`).join('')}</section>` : ''}
`;
  fs.writeFileSync(path.join(pageDir, 'index.html'), html);
  console.log(`\npage (${rows.length} stories, worst first): ${PAGE_DIR}/index.html`);
  return path.join(pageDir, 'index.html');
}

/** opens a file with the platform's default application, without waiting for it */
function openFile(file: string) {
  const [command, args] =
    process.platform === 'darwin'
      ? ['open', [file]]
      : process.platform === 'win32'
        ? ['cmd', ['/c', 'start', '', file]]
        : ['xdg-open', [file]];
  spawn(command, args, { detached: true, stdio: 'ignore' })
    .on('error', () => console.log(`could not open ${file}`))
    .unref();
}

/** every png under a directory, recursively, in a stable order */
function listPngs(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))
    .flatMap((entry) => {
      const full = path.join(dir, entry.name);
      return entry.isDirectory() ? listPngs(full) : entry.name.endsWith('.png') ? [full] : [];
    });
}

/** files to compare and files only listed as new, for both modes */
function collect(root: string, cross: boolean): { compared: string[]; added: string[] } {
  if (cross) {
    // the svg screenshots are git ignored, so they are listed from the file system
    const svgFiles = listPngs(path.join(root, SVG_DIR)).map((file) => path.relative(root, file));
    const hasCanvasBaseline = (file: string) =>
      fs.existsSync(path.join(root, CANVAS_DIR, path.relative(SVG_DIR, file)));
    return { compared: svgFiles.filter(hasCanvasBaseline), added: svgFiles.filter((f) => !hasCanvasBaseline(f)) };
  }
  const dirs = [CANVAS_DIR];
  return {
    compared: gitLines(root, ['diff', '--name-only', '--diff-filter=M', 'HEAD', '--', ...dirs]),
    added: [
      ...gitLines(root, ['diff', '--name-only', '--diff-filter=A', 'HEAD', '--', ...dirs]),
      ...gitLines(root, ['ls-files', '--others', '--exclude-standard', '--', ...dirs]),
    ],
  };
}

function main() {
  const { cross, threshold, top, filter, exclude, sheet, scale, page, open } = getArgs();
  const root = execFileSync('git', ['rev-parse', '--show-toplevel']).toString().trim();
  const readPair = cross ? crossPair(root) : committedPair(root);
  const matches = (file: string) => {
    const lower = file.toLowerCase();
    return lower.includes(filter) && !exclude.some((part) => lower.includes(part));
  };
  const { compared, added } = collect(root, cross);

  if (compared.length + added.length === 0) {
    console.log(cross ? 'no svg screenshots' : 'no changed screenshots');
    return;
  }

  const rows: Row[] = compared.filter(matches).map((file) => {
    const { diff, total, ratio, bbox, note } = compare(...readPair(file), threshold);
    return { file, status: 'modified', diff, total, ratio, bbox, note };
  });
  rows.sort((a, b) => b.ratio - a.ratio);
  const newLabel = cross ? 'no canvas baseline' : 'new';
  const newRows: Row[] = added
    .filter(matches)
    .map((file) => ({ file, status: 'new', diff: 0, total: 0, ratio: 0, bbox: '', note: '' }));

  const buckets: [string, (ratio: number) => boolean][] = [
    ['0', (r) => r === 0],
    ['<0.1%', (r) => r > 0 && r < 0.1],
    ['<1%', (r) => r >= 0.1 && r < 1],
    ['<5%', (r) => r >= 1 && r < 5],
    ['>=5%', (r) => r >= 5],
  ];
  const histogram = buckets.map(([label, test]) => `${label}: ${rows.filter(({ ratio }) => test(ratio)).length}`);
  const what = cross ? 'svg vs canvas' : 'changed';
  console.log(
    `${histogram.join(' | ')} | ${newLabel}: ${newRows.length}   (${rows.length} ${what}, threshold ${threshold})`,
  );

  const shown = [...rows, ...newRows].slice(0, top);
  const pathWidth = Math.max(...shown.map(({ file }) => path.relative(E2E_DIR, file).length), 5);
  console.log(
    `\n${'story'.padEnd(pathWidth)}  ${'pixels'.padStart(7)}  ${'ratio'.padStart(7)}  ${'bbox'.padEnd(19)}  note`,
  );
  shown.forEach(({ file, status, diff, ratio, bbox, note }) => {
    const story = path.relative(E2E_DIR, file).padEnd(pathWidth);
    const cells =
      status === 'new'
        ? [newLabel.padStart(7), ''.padStart(7)]
        : [String(diff).padStart(7), `${ratio.toFixed(2)}%`.padStart(7)];
    console.log(`${story}  ${cells.join('  ')}  ${bbox.padEnd(19)}  ${note}`);
  });
  if (shown.length < rows.length + newRows.length)
    console.log(`... ${rows.length + newRows.length - shown.length} more rows`);

  if (sheet > 0 && rows.length > 0) writeSheet(root, rows.slice(0, sheet), readPair, threshold, scale);
  if (page) {
    const file = writePage(root, rows, newRows, readPair, threshold, cross);
    if (open) openFile(file);
  }
}

main();

/* eslint-enable no-console */

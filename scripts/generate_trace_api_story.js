/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/**
 * Spec 20 — Auto-generated Trace API documentation story.
 *
 * Reads `packages/charts/tmp/charts.api.json` (produced by `yarn api:extract` with
 * `docModel.enabled: true`), walks the `TraceSpec` interface via
 * `findMembersWithInheritance()` to include inherited props like `id`, and emits
 * `storybook/stories/trace/24_api_docs.story.tsx`.
 *
 * Usage:
 *   yarn api:extract && node scripts/generate_trace_api_story.js
 *
 * The output is deterministic: same api.json input → identical output file.
 * No timestamps or other non-deterministic content is written.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const { ApiModel } = require('@microsoft/api-extractor-model');

// ---------------------------------------------------------------------------
// Paths (relative to repo root)
// ---------------------------------------------------------------------------
const REPO_ROOT = path.resolve(__dirname, '..');
const API_JSON = path.join(REPO_ROOT, 'packages/charts/tmp/charts.api.json');
const STORY_OUT = path.join(REPO_ROOT, 'storybook/stories/trace/01_intro.story.tsx');

// ---------------------------------------------------------------------------
// Internal discriminant props from the Spec base — not user-facing, skip.
// ---------------------------------------------------------------------------
const SKIP_PROPS = new Set(['specType', 'chartType']);

// ---------------------------------------------------------------------------
// TSDoc plain-text flattening
// ---------------------------------------------------------------------------

/**
 * Recursively flatten a TSDoc `DocNode` tree into plain text.
 * - PlainText → as-is
 * - CodeSpan → backtick-wrapped code text
 * - SoftBreak → single space
 * - LinkTag → link text (or identifier if no explicit text)
 * - Paragraphs and other container nodes → recurse, joined without extra separator
 *   (paragraphs in a summary section are joined with a space between them)
 */
function flattenDocNode(node) {
  if (!node) return '';
  switch (node.kind) {
    case 'PlainText':
      return node.text;
    case 'CodeSpan':
      return `\`${node.code}\``;
    case 'SoftBreak':
      return ' ';
    case 'EscapedText':
      // TSDoc escape sequences like \> → decoded to the actual character
      return node.decodedText != null ? node.decodedText : '';
    case 'HtmlStartTag':
      // Reconstruct HTML tag syntax from the parsed node name, e.g. <traceId>
      return node.name ? `<${node.name}>` : '';
    case 'HtmlEndTag':
      return node.name ? `</${node.name}>` : '';
    case 'LinkTag': {
      // Prefer explicit linkText; fall back to the last member identifier
      if (node.linkText) return node.linkText;
      const refs = node.codeDestination && node.codeDestination.memberReferences;
      if (refs && refs.length > 0) {
        const last = refs.at(-1);
        return last.memberIdentifier ? last.memberIdentifier.identifier : '';
      }
      return '';
    }
    case 'Paragraph': {
      // Flatten all child nodes; trim the result
      const text = (node.nodes || []).map(flattenDocNode).join('').trim();
      return text;
    }
    default:
      if (node.nodes) {
        return node.nodes.map(flattenDocNode).join('');
      }
      return '';
  }
}

/**
 * Flatten a TSDoc SummarySection (which contains one or more Paragraphs) into
 * a single plain-text string. Multiple paragraphs are joined with ' — '.
 */
function flattenSummary(summarySection) {
  if (!summarySection) return '';
  const paragraphs = (summarySection.nodes || [])
    .filter((n) => n.kind === 'Paragraph')
    .map(flattenDocNode)
    .filter((s) => s.length > 0);
  const joined = paragraphs.join(' — ');
  // Strip markdown link syntax [label](url) → label (TSDoc doesn't parse these)
  const stripped = joined.replaceAll(/\[([^\]]+)]\([^)]*\)/g, '$1');
  // Collapse runs of whitespace
  return stripped.replaceAll(/\s+/g, ' ').trim();
}

/**
 * Extract the text of the first `@defaultValue` TSDoc block tag, or '' if absent.
 */
function extractDefaultValue(tsdocComment) {
  if (!tsdocComment) return '';
  const block =
    tsdocComment.customBlocks &&
    tsdocComment.customBlocks.find((b) => b.blockTag && b.blockTag.tagName === '@defaultValue');
  if (!block) return '';
  return flattenDocNode(block.content).replaceAll(/\s+/g, ' ').trim();
}

// ---------------------------------------------------------------------------
// Core: walk TraceSpec and build row objects
// ---------------------------------------------------------------------------

/**
 * Walk the api model to find the TraceSpec interface.
 * @param {import('@microsoft/api-extractor-model').ApiItem} item
 * @returns {import('@microsoft/api-extractor-model').ApiInterface | null}
 */
function findTraceSpec(item) {
  if (item.kind === 'Interface' && item.displayName === 'TraceSpec') return item;
  for (const child of item.members || []) {
    const found = findTraceSpec(child);
    if (found) return found;
  }
  return null;
}

/**
 * Build the rows array from an ApiModel loaded from charts.api.json.
 * Exported so unit tests can call it without spawning api-extractor.
 *
 * @param {import('@microsoft/api-extractor-model').ApiModel} apiModel
 * @returns {Array<{name: string, type: string, required: boolean, defaultValue: string, description: string}>}
 */
function traceSpecRows(apiModel) {
  const pkg = apiModel.packages[0];
  if (!pkg) throw new Error('No package found in api model');
  const entry = pkg.entryPoints[0];
  if (!entry) throw new Error('No entry point found in api model package');

  const traceSpec = findTraceSpec(entry);
  if (!traceSpec) throw new Error('TraceSpec interface not found in api model');

  const { items } = traceSpec.findMembersWithInheritance();

  const rows = [];
  for (const member of items) {
    if (member.kind !== 'PropertySignature') continue;
    if (SKIP_PROPS.has(member.displayName)) continue;

    const typeText = member.propertyTypeExcerpt ? member.propertyTypeExcerpt.text.replaceAll(/\s+/g, ' ').trim() : '';

    rows.push({
      name: member.displayName,
      type: typeText,
      required: !member.isOptional,
      defaultValue: extractDefaultValue(member.tsdocComment),
      description: flattenSummary(member.tsdocComment && member.tsdocComment.summarySection),
    });
  }
  return rows;
}

// ---------------------------------------------------------------------------
// MDX generation
// ---------------------------------------------------------------------------

/**
 * Escape a string for use inside a Markdown table cell:
 * - Pipe characters → `\|` (avoid breaking the table)
 * - `<` and `>` outside backtick code spans → HTML entities (prevent markdown renderers treating them as tags)
 */
function mdCell(s) {
  let inCode = false;
  let result = '';
  for (const ch of s) {
    if (ch === '`') {
      inCode = !inCode;
      result += ch;
    } else if (!inCode && ch === '<') {
      result += '&lt;';
    } else if (!inCode && ch === '>') {
      result += '&gt;';
    } else if (ch === '|') {
      result += '\\|';
    } else {
      result += ch;
    }
  }
  return result;
}

/**
 * Build the `markdownContent` replacement block from the rows array.
 * Returns only the two-line declaration that gets spliced into 01_intro.story.tsx —
 * not the full file. No timestamps or other non-deterministic content.
 *
 * @param {Array<{name: string, type: string, required: boolean, defaultValue: string, description: string}>} rows
 * @returns {string}
 */
function renderStory(rows) {
  const DIVIDER = '|------|------|---------|----------|-------------|';
  const HEADER = '| Name | Type | Default | Required | Description |';

  const tableRows = rows
    .map((r) => {
      const name = mdCell(`\`${r.name}\``);
      const type = r.type ? mdCell(`\`${r.type}\``) : '';
      const def = r.defaultValue ? mdCell(`\`${r.defaultValue}\``) : '';
      const req = r.required ? 'yes' : '';
      const desc = mdCell(r.description);
      return `| ${name} | ${type} | ${def} | ${req} | ${desc} |`;
    })
    .join('\n');

  const markdown = [
    '## `<Trace>` API Reference',
    '',
    'The `Trace` component accepts the following props via the `Trace` spec. This table is',
    'auto-generated from the TypeScript types — run `yarn generate:trace-api-story` to refresh it.',
    '',
    HEADER,
    DIVIDER,
    tableRows,
  ].join('\n');

  // JSON.stringify handles all escaping: backslashes (\|), backticks, newlines, etc.
  const jsonMarkdown = JSON.stringify(markdown);
  return `// prettier-ignore\nconst markdownContent = ${jsonMarkdown};\n`;
}

/**
 * Splice a new `markdownContent` declaration into the existing intro story source.
 * Matches the `// prettier-ignore` + `const markdownContent = ...;` block and replaces it.
 *
 * @param {string} existingContent - current source of 01_intro.story.tsx
 * @param {string} replacement - output of renderStory()
 * @returns {string} updated source
 */
function patchIntroStory(existingContent, replacement) {
  const MARKER = /\/\/ prettier-ignore\nconst markdownContent = [^\n]+;\n/;
  if (!MARKER.test(existingContent)) {
    throw new Error(`markdownContent variable not found in ${STORY_OUT}`);
  }
  return existingContent.replace(MARKER, replacement);
}

// ---------------------------------------------------------------------------
// Entry point (run directly)
// ---------------------------------------------------------------------------

if (require.main === module) {
  if (!fs.existsSync(API_JSON)) {
    console.error(
      `\nError: ${API_JSON} not found.\n` +
        'Run `yarn api:extract` first to generate the doc model, then re-run this script.\n',
    );
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1);
  }

  const apiModel = new ApiModel();
  apiModel.loadPackage(API_JSON);

  const rows = traceSpecRows(apiModel);
  const replacement = renderStory(rows);
  const existing = fs.readFileSync(STORY_OUT, 'utf8');
  const updated = patchIntroStory(existing, replacement);

  fs.writeFileSync(STORY_OUT, updated, 'utf8');
  console.log(`Updated markdownContent in ${path.relative(REPO_ROOT, STORY_OUT)} (${rows.length} rows)`);
}

// ---------------------------------------------------------------------------
// Exports for unit tests
// ---------------------------------------------------------------------------

module.exports = { traceSpecRows, renderStory, patchIntroStory, flattenSummary, extractDefaultValue };

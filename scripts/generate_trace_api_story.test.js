/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

'use strict';

const path = require('path');
const { ApiModel } = require('@microsoft/api-extractor-model');
const { traceSpecRows, renderStory, patchIntroStory, flattenSummary, extractDefaultValue } = require('./generate_trace_api_story');

const FIXTURE = path.join(__dirname, '__fixtures__/trace_api_fixture.api.json');

// ---------------------------------------------------------------------------
// Helper: load fixture once
// ---------------------------------------------------------------------------

let cachedRows;
function rows() {
  if (!cachedRows) {
    const model = new ApiModel();
    model.loadPackage(FIXTURE);
    cachedRows = traceSpecRows(model);
  }
  return cachedRows;
}

// ---------------------------------------------------------------------------
// traceSpecRows — member inclusion / exclusion
// ---------------------------------------------------------------------------

describe('traceSpecRows', () => {
  it('includes the inherited id prop from the Spec base', () => {
    expect(rows().some((r) => r.name === 'id')).toBe(true);
  });

  it('skips specType and chartType discriminants', () => {
    const names = rows().map((r) => r.name);
    expect(names).not.toContain('specType');
    expect(names).not.toContain('chartType');
  });

  it('marks required props as required: true', () => {
    const data = rows().find((r) => r.name === 'data');
    expect(data).toBeDefined();
    expect(data.required).toBe(true);
  });

  it('marks optional props as required: false', () => {
    const mode = rows().find((r) => r.name === 'mode');
    expect(mode).toBeDefined();
    expect(mode.required).toBe(false);
  });

  it('extracts @defaultValue text from optional props', () => {
    const mode = rows().find((r) => r.name === 'mode');
    expect(mode.defaultValue).toBe("'a'");
  });

  it('leaves defaultValue empty for props without @defaultValue', () => {
    const data = rows().find((r) => r.name === 'data');
    expect(data.defaultValue).toBe('');
  });

  it('populates description from the TSDoc summary', () => {
    const data = rows().find((r) => r.name === 'data');
    expect(data.description).toBe('Span data array.');
  });

  it('extracts the type text', () => {
    const mode = rows().find((r) => r.name === 'mode');
    expect(mode.type).toBe("'a' | 'b'");
  });
});

// ---------------------------------------------------------------------------
// renderStory — output format
// ---------------------------------------------------------------------------

describe('renderStory', () => {
  let output;
  beforeAll(() => {
    output = renderStory(rows());
  });

  it('is idempotent — same input yields identical string twice', () => {
    expect(renderStory(rows())).toBe(output);
  });

  it('is the prettier-ignore + markdownContent declaration only', () => {
    expect(output).toMatch(/^\/\/ prettier-ignore\nconst markdownContent = ".*";\n$/s);
  });

  it('embeds the markdown content as a JSON string', () => {
    expect(output).toContain('const markdownContent =');
    expect(output).toContain('API Reference');
  });

  it('renders a Markdown table with required column headers', () => {
    expect(output).toContain('| Name | Type | Default | Required | Description |');
  });

  it('marks required props with "yes" in the Required column', () => {
    expect(output).toMatch(/\| `id` \|[^|]*\|[^|]*\| yes \|/);
  });

  it('leaves the Required column blank for optional props', () => {
    expect(output).toContain("`'a'` |  | Display mode. |");
  });

  it('wraps type values in backticks', () => {
    expect(output).toContain('`string[]`');
  });

  it('wraps default values in backticks', () => {
    expect(output).toContain("`'a'`");
  });

  it('escapes pipe characters in union type values', () => {
    // mdCell converts | → \| in Markdown; JSON.stringify then doubles the backslash → \\|
    expect(output).toContain("'a' \\\\| 'b'");
  });
});

// ---------------------------------------------------------------------------
// patchIntroStory
// ---------------------------------------------------------------------------

describe('patchIntroStory', () => {
  const FAKE_INTRO = [
    '// some hand-written content',
    '// prettier-ignore',
    'const markdownContent = "old content";',
    'Example.storyName = \'Intro & API docs\';',
    '',
  ].join('\n');

  it('replaces the markdownContent declaration with the new one', () => {
    const replacement = renderStory(rows());
    const patched = patchIntroStory(FAKE_INTRO, replacement);
    expect(patched).toContain('API Reference');
    expect(patched).not.toContain('"old content"');
  });

  it('preserves content before and after the declaration', () => {
    const replacement = renderStory(rows());
    const patched = patchIntroStory(FAKE_INTRO, replacement);
    expect(patched).toContain('// some hand-written content');
    expect(patched).toContain("Example.storyName = 'Intro & API docs'");
  });

  it('throws if the markdownContent variable is not found', () => {
    expect(() => patchIntroStory('no marker here', renderStory(rows()))).toThrow('markdownContent');
  });
});

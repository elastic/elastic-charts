# Accessibility Coverage Scripts

This directory contains scripts to analyze accessibility test coverage for Storybook URLs.

## Scripts

### `a11y:coverage` (Quick Summary)

```bash
yarn a11y:coverage
```

Shows a quick summary of accessibility test coverage:
- Total Storybook URLs found in e2e tests
- Number of URLs with a11y coverage
- Number of URLs missing a11y coverage
- Coverage percentage

### `a11y:coverage:full` (Detailed Report)

```bash
yarn a11y:coverage:full
```

Generates a comprehensive report including:
- Detailed breakdown by test file
- Specific missing test cases
- Recommendations for priority improvements
- JSON report file (`a11y-coverage-report.json`)

#### Additional Options

```bash
# Include integrity check with coverage analysis
yarn a11y:coverage:full --integrity

# Run integrity check only (no coverage analysis)
yarn a11y:coverage:full --integrity-only

# Verbose output
yarn a11y:coverage:full --verbose
```

### Integrity Check

The integrity check ensures that the JSON configuration file (`scripts/check-a11y-coverage.json`) stays in sync with the actual e2e test files. It will:

- ✅ **Pass**: When all URLs in e2e tests are documented in the JSON file
- ❌ **Fail**: When there are missing URLs or obsolete entries
- 📝 **Report**: Specific URLs that need to be added or removed

The integrity check automatically exits with code 1 if validation fails, making it suitable for CI integration.

## How it Works

1. **Extract Storybook URLs**: Scans all `e2e/tests/*.test.ts` files to find Storybook URLs
2. **Find A11y Coverage**: Scans all `e2e/tests_a11y/*.test.ts` files to find which URLs have accessibility tests
3. **Filter Interactions**: Automatically excludes URLs that involve interactions (hover, click, tooltips, etc.) as these are not suitable for static accessibility testing
4. **Generate Reports**: Compares coverage and identifies gaps

## What URLs Are Skipped

The script automatically excludes URLs that involve user interactions:
- Tooltip interactions
- Hover states
- Click interactions
- Brush/zoom interactions
- Crosshair/cursor interactions
- Keyboard navigation tests

These are skipped because accessibility tests focus on static screen reader descriptions rather than interactive behavior.

## Output Files

- `a11y-coverage-report.json`: Detailed JSON report with all findings
- Console output: Human-readable summary and recommendations

## Coverage Goals

The goal is to have accessibility tests for all non-interactive Storybook stories to ensure:
- Screen readers can properly describe chart content
- Chart accessibility descriptions are accurate
- Edge cases and different chart configurations are covered

Current coverage: **54.3%** (50/92 eligible URLs)

## JSON Configuration File

The `scripts/check-a11y-coverage.json` file contains metadata about each Storybook URL found in e2e tests:

```json
{
  "testFileName": "bar_stories.test.ts",
  "testName": "stacked bar chart - basic",
  "storybookUrl": "http://localhost:9001/?path=/story/bar-chart--stacked-as-percentage",
  "shouldCreateA11yTest": true,
  "reason": "Static chart rendering test, good for testing accessibility descriptions",
  "a11yFileName": "bar_chart_a11y.test.ts",
  "checked": true
}
```

This file should be kept in sync with actual e2e tests using the integrity check.

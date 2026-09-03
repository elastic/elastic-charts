# ADR 0017 — Trace viz story organisation principles

**Status:** Accepted

## Context

The Trace viz stories (`storybook/stories/trace/`) grew incrementally alongside specs, and by
Spec 13 each story had mixed three kinds of content inside the exported `Example` function:
the actual feature demo (the `<Chart><Trace/>` call), large data fixtures, long descriptive
prose with inline JSX, and helper UI (reference tables, log panels, aria-live mirrors). Two
different Storybook source views make this matter concretely:

- **`addon-storysource`** shows the whole file in a "Source" panel — readers see everything.
- **`addon-docs` "Show code"** shows only the `Example` function body — so what lives there is
  what consumers see as the "recipe" for the feature.

The mismatch created stories that were simultaneously too long (too much noise in "Show code")
and not self-documenting (prose buried below the canvas, or hidden by overflow).

Several decisions below are non-obvious from the code alone and the result of genuine
trade-offs.

---

## Decision 1: `Example` body = data → chart → feature controls only

The exported `Example` function body should read as a complete, minimal recipe:

```tsx
export const Example: ChartsStory = (_, { title, description }) => {
  const knob = select(…);       // feature controls at the top
  return (
    <Chart …>
      <Settings baseTheme={useBaseTheme()} />
      <Trace id="…" data={DATA} featureProp={knob} />
    </Chart>
  );
};
```

No prose `<p>` tags, no decorative wrapper `<div>`s, no reference tables, no log panels inside
the function — unless that UI is itself the feature being demonstrated (e.g. the
`TraceCustomTooltip` in story 07, or the `onSelectionChange` log in story 17). Everything else
moves to the three hooks described below.

**Why this is non-obvious:** Storybook does not enforce this separation; most stories grow
organically and accumulate prose and helper UI without any structural pressure to extract them.
The "Show code" surface makes this costly: a consumer looking for the canonical `<Trace …>` call
pattern sees two screens of noise before finding it.

**Rejected: extracting just the prose but keeping tables inline.** Tables like
`<KeyboardReference/>` and `<GestureReference/>` account for 30-50 lines each. Leaving them
inside the function still crowds the "Show code" view with non-feature code.

---

## Decision 2: Prose → `Example.parameters.markdown`

Descriptive text (what the feature does, how to exercise it) moves to
`Example.parameters.markdown`. `StoryWrapper` renders it as `<EuiMarkdownFormat>` in a separate
`EuiFlexItem` below the story canvas, entirely outside the `Example` function body. The "Show
code" view never includes it.

```ts
Example.parameters = {
  markdown: 'One paragraph explaining the feature and how to interact with it.',
};
```

**Why this is non-obvious:** `markdown` is a custom parameter defined by this repo's
`StoryParameters` type, not a standard Storybook parameter. Developers unfamiliar with the
codebase would default to inline JSX prose or a `<p>` inside the story function.

**Consequence:** `showHeader` is a **global toggle** (read from `globals.toggles` in
`story_wrapper.tsx`), not a story parameter — `Example.parameters = { showHeader: true }` is a
no-op and must not be written into stories.

---

## Decision 3: Shared data module at `./data.ts`, outside the story glob

Large or reused data fixtures are extracted to `storybook/stories/trace/data.ts`. This file is
NOT matched by the Storybook story glob (`*.(stories|story).ts?(x)`) so it does not register as
a story. It exports typed, TSDoc-documented constants and generators (`CHECKOUT_SPANS`,
`A11Y_TRACE`, `SELECTION_TRACE`, `buildLargeTrace`, …).

Small, single-use fixtures stay inline inside `Example`, with a `// TraceDatum[]` shape comment
showing the fixture structure clearly in "Show code".

**Why this is non-obvious:** The filename convention (`data.ts` vs `data.stories.ts`) is the
only mechanism keeping this module out of the Storybook sidebar. A `.story.ts` or `.stories.ts`
suffix would accidentally register it.

**Trade-off:** Moving fixtures out of the story means they are no longer visible in "Show code".
This is acceptable for large fixtures (hundreds of lines) whose shape is documented by type and
TSDoc; for small fixtures the inline form is preferred precisely because the structure is the
educational content.

---

## Decision 4: Story utility components at `./story_components.tsx`

Helper UI that is not part of the feature API moves to
`storybook/stories/trace/story_components.tsx`. Current exports: `KeyboardReference`,
`GestureReference`, `LogPanel`, `AriaLiveMirror`, `formatSelection`, `formatSelectionDetail`.

Rendering these inside a story as `<KeyboardReference/>` signals to the reader "this is a
story-utility, not a feature call". A named component reference is both clearly non-API code and
a stable import contract that can be reused across stories.

**Rejected: using an anonymous inline render or a `StoryDescription` wrapper.** An anonymous
render keeps all the JSX noise inside the function. A generic `<StoryDescription>` wrapper would
be semantically vague and harder to refactor per-component.

**Rejected: co-locating the components with each story.** Keyboard/gesture reference content is
fixed across all stories that use it; having separate copies creates drift.

---

## Decision 5: Debug stories (02–05) keep their internal canvas/div rendering

Stories 02 (`self_time_debug`), 03 (`geometry_debug`), 04 (`time_bar`), and 05 (`renderer`)
hand-render the pipeline output (`normalize → resolveActive → buildGeometry → canvas2dRenderer`)
as divs or canvases. This rendering IS the feature they demonstrate — extracting it would remove
the educational content. The `echChart` + `echChartStatus` wrapper pattern is used for
Storybook render-complete signalling.

All other decisions in this ADR apply equally to debug stories: prose moves to `markdown`,
data to `data.ts`, and any debug inspector (e.g. a `<details>` JSON dump) must be placed
**outside the `echChart` div** (see Decision 6).

---

## Decision 6: `<details>` and other non-chart content must live outside `echChart`

The `echChart` CSS class (from the `@elastic/charts` library) sets `overflow: hidden`. Any
content that extends below the chart area — a `<details>` geometry dump, a reference table, a
log panel — will be clipped if placed inside `echChart`. Such content must be rendered as a DOM
sibling of the `echChart` div, wrapped in the story's outer container.

**Pattern for debug stories:**

```tsx
export const Example = () => (
  <div style={{ fontFamily: 'sans-serif' }}>
    <div className="echChart">
      <div className="echChartStatus" data-ech-render-complete={true} />
      <div style={{ padding: 24 }}>
        <CanvasOrOverlay />
      </div>
    </div>
    {/* <details> or other debug UI lives here, outside echChart */}
    <details style={{ marginTop: 24, padding: '0 24px' }}>…</details>
  </div>
);
```

---

## Decision 7: Tall stories use `resize` parameter to keep markdown visible

When a story's content (chart + panels + reference table) is taller than the visible viewport,
the `markdown` description scrolls off and is effectively hidden. The idiomatic fix is the
`resize` story parameter (`StoryParameters.resize: boolean | CSSProperties`), which wraps the
story output in a `<div>` with the given styles. Setting a fixed height with `overflow: auto`
bounds the story canvas area while the markdown lives in a separate `EuiFlexItem` below,
always visible.

```ts
Example.parameters = {
  resize: { height: '480px', overflowY: 'auto' },
  markdown: '…',
};
```

**Why this is non-obvious:** The `story_wrapper.tsx` layout places the story in
`<EuiFlexItem grow={false}>` and the markdown in the next `EuiFlexItem`. Without the `resize`
constraint the story-root div takes its natural height; if that height fills the iframe the
markdown is simply off-screen. Applying `maxHeight` to the returned JSX root does not help
because the `story-root` div and `EuiFlexItem` above it have no height constraint of their own.
The `resize` wrapper is the only hook that constrains the story canvas area from inside the
story's parameter contract.

**Sizing heuristic:** set the height to fit the chart and the collapsed form of any reference
table or details block, so the markdown is visible without scrolling. Expanded content (an open
`<details>` or a long table) scrolls within the bounded area.

---

## Consequences

- Every story in the Trace viz folder should pass the two-second "Show code" test: a developer
  opening the addon-docs source panel should see only the feature call and its direct controls,
  not prose or utility UI.
- `data.ts` and `story_components.tsx` are the two canonical extension points; new fixtures and
  new helper components go there, not inline in new stories.
- Stories that introduce tall helper UI must include a `resize` parameter from the start — it
  is easier to set than to discover later why the markdown is invisible.
- The `showHeader` no-op must not be copied into new stories; the canonical `Example.parameters`
  entry is `{ markdown: '…' }` (and optionally `resize: {…}`).

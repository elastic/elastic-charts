## Summary

<!--
  Summarize your PR. This will be included in our newsletter

  - The summary is intended for a consumer audience, avoid any internal or implementation details. You can include those in the details section.
  - Generally only `fix:` and `feat:` PRs will be included in the newsletter. Also, PRs with BREAKING CHANGES are added.
  - Describe the feature or fix as you would if you were advertising it in the newsletter:
      - ❌ : This commit close the request `#123` and adds the prop `helloWorld` to `Settings`
      - ✅ : The `helloWorld` prop is now available in the `Settings` component to bring joy when rendering the chart.
      - ❌ : Fixing the tooltip position outside the chart area avoiding overflows.
      - ✅ : The tooltip no longer overflows the chart DOM container when using the `tooltip.boundary = 'chart'` in the `Settings` component.
  - Add a clear screenshot or animated gif as an example if the change can be understood better and easier with a visual aid.
  - If the PR involves a bigger feature, please add more context to it, describing why the feature was added, what actually improve, and how the users can leverage it to improve their data visualizations
  - If the PR involves a breaking change include the following part and clearly state which contract is broken:

    ### BREAKING CHANGE
    The `tooltip.boundary` prop in the `Settings` component now only accepts a single DOM element ID.
-->



<!-- screenshot/gif/mpeg-4 for visual changes -->


## Details

<!-- Details beyond the summary to explain nuances -->


## Issues

<!--
  Issues this pr is fixing or closing

  e.g.

  This completes a missing feature requested by APM regarding the tooltip positioning #921
  fix #1108
-->



### Checklist

<!-- Delete any items that are not applicable to this PR. -->
- [ ] The proper **chart type** label has been added (e.g. `:xy`, `:partition`)
- [ ] The proper **feature** labels have been added (e.g. `:interactions`, `:axis`)
- [ ] All related issues have been linked (i.e. `closes #123`, `fixes #123`)
- [ ] New public API exports have been added to `packages/charts/src/index.ts`
- [ ] Unit tests have been added or updated to match the most common scenarios
- [ ] The proper documentation and/or storybook story has been added or updated
- [ ] The code has been checked for cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- [ ] Visual changes have been tested with `light` and `dark` themes

### Knowledge-harvest gate (trace-viz features only)

<!-- Complete this section when merging a trace-viz feature and deleting its implementation plan.
     Each item ensures durable knowledge is preserved before the ephemeral spec is discarded. -->

- [ ] Edge cases moved to anchored acceptance criteria in `docs/adr/trace-viz/trace-chart.md` (`## Behavior & acceptance`).
- [ ] Non-obvious mechanism/trade-off rationale promoted to ADRs (linked under `## Decisions` in the behavioral spec).
- [ ] Scope rationale captured in `## Non-goals` of the behavioral spec, each entry with its one-line reason.
- [ ] Pure implementation rationale left as code comments at the source (not in any doc).
- [ ] Implementation plan deleted.

<details>
<summary>Agent prompt — update the behavioral spec</summary>

Copy the block below into your Claude Code session. Fill in the `[…]` placeholder with the name/path of the implementation spec (or paste its contents) before sending.

```
Update docs/adr/trace-viz/trace-chart.md to fold in the durable behavioral knowledge
from the feature just shipped.

Feature / spec being harvested: […]

Apply the four-way routing rule to every piece of knowledge in the implementation plan:

  1. Public API change (new or changed exported type, prop, or function)
     → add or update the relevant row in ## Public API.

  2. Behavioral edge case, gesture/modifier-key table, or ## Edge cases table
     → add as an anchored acceptance criterion in ## Behavior & acceptance.
        Each bullet must end with a proof anchor:
          {story:exportName}             — export { … as exportName } in trace.stories.tsx
          {test:path/to/file.test.ts#"substring"}  — file exists and contains that string

  3. Non-obvious mechanism or trade-off rationale not already in an ADR
     → propose a new ADR under docs/adr/trace-viz/ and link it under ## Decisions.

  4. Scope boundary or explicit non-goal
     → add to ## Non-goals with a one-line reason (the "why", not just the "what").

  5. Pure implementation mechanics (file layout, internal steps, line numbers)
     → discard — this lives in git history, not in docs.

Hard rules — the edit must not introduce any of these (they cause drift):
  ✗  File paths ending in .ts or .tsx (e.g. normalize.ts, data/colors.ts)
  ✗  Line-number references (L59, file.ts:30, currently ~L137)
  ✗  Internal (non-exported) function names (dropNonFinite, resolveActive, parseSimple, …)
  ✓  Exported/public names are allowed: TraceDatum, TraceSpec, colorBy, laneOrder, fromOtlp, …

After editing, verify manually:
  • Every {story:X} export name exists in storybook/stories/trace/trace.stories.tsx
  • Every {test:P#"S"} file exists and contains the quoted substring
  • Every relative markdown link (./NNNN-*.md) resolves to a real file
```

</details>

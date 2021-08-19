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
- [ ] The code changes are specific to a chart type, the chart type label is attached (e.g. `:xy`, `:partition`)
- [ ] The code changes are specific to one or more features, one or more feature labels are attached (e.g. `:interactions`, `:axis`)
- [ ] `Theme` API change is introduced, the `:theme` label is attached and the EUI team is pinged
- [ ] The closing issue/s is connected to a running GH project (if not, recheck with the team the priority)
- [ ] Any new public API export must be added to the `packages/charts/src/index.ts`
- [ ] Unit tests are added/updated to match the most common scenarios
- [ ] The feature requires a specific explanation, documentation and/or a storybook story is added
- [ ] Any added stories must import from `@elastic/charts` except for test data & storybook
- [ ] The code is checked for cross-browser compatibility (Chrome, Firefox, Edge)
- [ ] The visual changes are tested with every available theme (darkmode, lightmode, EUI related) 

# Elastic Charts review guidance

- Require every pull request to be the minimal changeset for its stated issue. Flag unrelated cleanup.
- Treat `packages/charts/src/index.ts` and `packages/charts/api/charts.api.md` as the public contract. Flag new exports not added to the index, unlabeled breaking spec, prop, or type changes, and api-extractor drift that is not explained.
- When the public spec or published types change, flag Kibana-consumer upgrade and compatibility risk. This is not a Kibana review.
- For user-visible chart or interaction changes, require focused unit coverage of the common path, and Storybook and/or docs when consumers need to learn the new behavior.
- Grade visual and theme changes against both light and dark, and against existing theme and contrast helpers. Do not request screenshot PNG updates; those are handled outside review.
- For accessibility-affecting changes, check keyboard paths and the chart screen-reader summary and description components, not ESLint jsx-a11y nits.
- For time-domain, timezone, or scale changes, look for coverage under the timezone test lanes (`test:tz`), not only the default Jest run.
- Prefer existing chart-type and state/spec patterns in `packages/charts/src` over new parallel abstractions.

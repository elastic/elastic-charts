# A span's active segment(s) default to its self time, not its full duration

**Status:** accepted

Every span in the Trace waterfall draws a thin **total line** for its full `[start,end]` and 0..N solid
**active segments** inside it. The simple input format may supply `active` explicitly, but OpenTelemetry
spans carry no such sub-range — so for OTel input, `active` is derived as **self time**: the span's
extent minus the union of its children's extents (sorted-interval subtraction, 0..N resulting segments).
Without this, every OTel span's active segment would equal its total line, making the visual distinction
the whole feature is built around invisible for the format that's expected to be the primary input. This
also means the parent-child tree (via `parentId`) is required at normalization time, not merely stored
for a future hierarchy view as first assumed.

## Considered options

- **OTel active = full span** (line and rect coincide) — rejected: defeats the purpose of drawing two
  marks per span; the distinction would only ever be visible for hand-authored simple-format data.
- **One "biggest gap" rect per span** — rejected: a lossy, arbitrary summary of self time when a span
  has multiple children with gaps between them.
- **Self time as 0..N segments** (chosen) — matches how APM tools already define and display self time;
  correct for any number of children.

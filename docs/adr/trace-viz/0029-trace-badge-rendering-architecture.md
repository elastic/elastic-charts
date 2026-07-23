---
status: provisional
domain: trace-viz
owners: []
supersedes: []
---

# Trace badge rendering architecture

## Context

Trace Span badges need compact EUI-like visuals with text, image sources, loading and failure
placeholders, hover and activation hit testing, accessibility exposure, and optional visibility in
label-less modes. They must stay visually synchronized with Trace zoom, pan, vertical scroll, and
animation.

The rendering choice is not obvious:

- DOM rendering can reuse browser layout and potentially EUI-like composition, but introduces
  per-visible-badge DOM nodes, synchronization during canvas transforms, layering concerns, and
  export/screenshot ambiguity.
- Canvas2D rendering keeps badges in the same draw loop as spans and annotations, but requires
  Charts-owned badge drawing, text measurement, image loading state, placeholder rendering, and hit
  testing.
- A hybrid approach may split responsibilities, but risks paying complexity from both sides.

## Decision

Pending measured investigation. Implementation must not begin until this ADR chooses DOM, Canvas2D,
or hybrid rendering for Span badges.

## Required evidence

- Measure pan and zoom behavior with representative visible-lane counts and badge densities.
- Compare visual synchronization quality between badge marks and canvas spans during interaction.
- Verify hover and click hit-testing behavior under scroll, zoom, and label modes.
- Evaluate image loading, placeholder, and failure behavior for repeated image sources.
- Decide export/screenshot expectations and whether the chosen architecture can satisfy them.
- Compare accessibility implementation cost for interactive badges without excessive tab stops.
- Do not set hard numeric performance budgets until the investigation produces baseline measurements.

## Consequences

- The behavioral badge spec defines what Span badges do; this ADR will decide how they are rendered.
- Until this ADR is resolved, badge export fidelity and DOM/component reuse remain unsettled.

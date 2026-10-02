# ADR 0009 — Brush rubber-band is a CSS `<div>`, not a canvas draw

The brush selection rect (Shift+drag, X-only) is rendered as a positioned `<div>` overlay inside the
`<figure>`, sized and shown/hidden via `setState`. Drawing it on the canvas was considered but
rejected: it would require the RAF loop to keep running during the brush gesture solely to repaint
the rect each frame, coupling brush rendering to the animation loop for no visual benefit. A CSS div
achieves identical appearance, needs no DPR scaling, and is cleared for free on `mouseup`. The
`BrushTool` canvas component used by XY and heatmap was also considered but rejected: it is
redux-driven and incompatible with the trace chart's self-managed interaction model.

/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/* The below file has been derived from src/traces/parcoords/axisbrush.js as of March 2018, commit
 * Original MIT license in the plotly.js repo as of 40b0c2bce9f8705e33c5badb6888131dcd74bf17
 * The file heavily depends on D3 DOM manipulation
 * todo: replace this with either Canvas2d and plain functions, or a React tree
 * todo: alternatively clean up the copyright block
 */

/**
 * Copyright 2012-2018, Plotly, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import d3 from 'd3';

import { classNames, VERTICAL_PADDING } from '../src/config';
import { keyFun, repeat } from '../src/utils';

const barConfig = {
  fillWidth: 4,
  fillColor: 'magenta',
  fillOpacity: 1,
  captureWidth: 15,
  strokeWidth: 0,
  strokeColor: 'transparent',
  strokeOpacity: 1,
  handleHeight: 8,
};

const barHorizontalSetup = (selection) => {
  selection.attr('x', -barConfig.captureWidth / 2).attr('width', barConfig.captureWidth);
};

const backgroundBarHorizontalSetup = (selection) => {
  selection.attr('visibility', 'visible').style('visibility', 'visible').attr('fill', 'yellow').attr('opacity', 0);
};

/** @internal */
export const filterActive = (brush) => brush.filterSpecified;

const setHighlight = (d) => {
  if (!filterActive(d.brush)) {
    return `0 ${d.height}`;
  }
  const unitRanges = d.brush.filter.get();
  const pixelRanges = [unitRanges.map((pr) => d.unitScaleInOrder(pr))];
  const dashArray = [0]; // we start with a 0 length selection as filter ranges are inclusive, not exclusive
  let p, sectionHeight, iNext;
  let currentGap = pixelRanges.length ? pixelRanges[0][0] : null;
  for (let i = 0; i < pixelRanges.length; i++) {
    p = pixelRanges[i];
    sectionHeight = p[1] - p[0];
    dashArray.push(currentGap);
    dashArray.push(sectionHeight);
    iNext = i + 1;
    if (iNext < pixelRanges.length) currentGap = pixelRanges[iNext][0] - p[1];
  }
  dashArray.push(d.height);
  // d.height is added at the end to ensure that (1) we have an even number of dasharray points, MDN page says
  // "If an odd number of values is provided, then the list of values is repeated to yield an even number of values."
  // and (2) it's _at least_ as long as the full height (even if range is minuscule and at the bottom) though this
  // may not be necessary, maybe duplicating the last point would do too. But no harm in a longer dasharray than line.
  return dashArray;
};

const differentInterval = (int1) => {
  // An interval is different if the extents don't match, which is a safe test only because the intervals
  // get consolidated anyway (ie. the identity of overlapping intervals won't be preserved; they get fused)
  return (int2) => int1[0] !== int2[0] || int1[1] !== int2[1];
};

const clearCursor = () => d3.select(document.body).style('cursor', null);
const north = (fPix, y) => fPix[1] <= y && y <= fPix[1] + barConfig.handleHeight;
const middle = (fPix, y) => fPix[0] < y && y < fPix[1];
const south = (fPix, y) => fPix[0] - barConfig.handleHeight <= y && y <= fPix[0];

const styleHighlight = (selection) => {
  // stroke-dasharray is used to minimize the number of created DOM nodes, because the requirement calls for up to
  // 1000 individual selections on an axis, and there can be 60 axes per plom, and multiple plom per
  // dashboard. The technique is similar to https://codepen.io/monfera/pen/rLYqWR and using a `polyline` with
  // multiple sections, or a `path` element via its `d` attribute would also be DOM-sparing alternatives.
  selection.attr('stroke-dasharray', setHighlight);
};

const renderHighlight = (root) => styleHighlight(d3.select(root).selectAll('.highlight, .highlightShadow'));

const getInterval = (b, unitScaleInOrder, y) => {
  const interval = b.filter.get();
  const intervalPix = interval.map(unitScaleInOrder);
  return {
    interval,
    intervalPix,
    n: north(intervalPix, y),
    m: middle(intervalPix, y),
    s: south(intervalPix, y),
  };
};

const brushClear = (brush) => {
  brush.filterSpecified = false;
  brush.svgBrush.extent = [0, 1];
};

const attachDragBehavior = function (selection) {
  // There's some fiddling with pointer cursor styling so that the cursor preserves its shape while dragging a brush
  // even if the cursor strays from the interacting bar, which is bound to happen as bars are thin and the user
  // will inevitably leave the hotspot strip. In this regard, it does something similar to what the D3 brush would do.
  selection
    .on('mousemove', function (d) {
      d3.event.preventDefault();
      const b = d.brush;
      if (d.parent.inBrushDrag) return;
      const y = d.unitScaleInOrder(d.unitScale.invert(d3.mouse(this)[1]));
      const interval = getInterval(b, d.unitScaleInOrder, y);
      const h = d.special === 'top' || d.special === 'bottom';
      d3.select(document.body).style(
        'cursor',
        interval.n
          ? h
            ? 'e-resize'
            : 'n-resize'
          : interval.s
          ? h
            ? 'w-resize'
            : 's-resize'
          : !interval.m
          ? 'crosshair'
          : filterActive(b)
          ? h
            ? 'ew-resize'
            : 'ns-resize'
          : 'crosshair',
      );
    })
    .on('mouseleave', (d) => {
      if (d.parent.inBrushDrag) return;
      clearCursor();
    })
    .call(
      d3.behavior
        .drag()
        .on('dragstart', function (d) {
          const e = d3.event;
          e.sourceEvent.stopPropagation();
          const y = d.unitScaleInOrder(d.unitScale.invert(d3.mouse(this)[1]));
          const unitLocation = d.unitScaleInOrder.invert(y);
          const b = d.brush;
          const intData = getInterval(b, d.unitScaleInOrder, y);
          const unitRange = intData.interval;
          const pixelRange = unitRange.map(d.unitScaleInOrder);
          const s = b.svgBrush;
          const active = filterActive(b);
          const barInteraction = unitRange && (intData.m || intData.s || intData.n);
          s.wasDragged = false; // we start assuming there won't be a drag - useful for reset
          s.grabPoint = d.unitScaleInOrder(unitLocation) - pixelRange[0] - VERTICAL_PADDING;
          s.barLength = pixelRange[1] - pixelRange[0];
          s.grabbingBar = active && intData.m && unitRange;
          s.stayingIntervals = barInteraction ? b.filter.get().filter(differentInterval(unitRange)) : b.filter.get(); // keep all preexisting bars if interaction wasn't a barInteraction
          const grabbingBarNorth = intData.n;
          const grabbingBarSouth = intData.s;
          const newBrushing = !s.grabbingBar && !grabbingBarNorth && !grabbingBarSouth;
          s.startExtent = newBrushing ? d.unitScaleInOrder.invert(y) : grabbingBarSouth ? unitRange[1] : unitRange[0];
          d.parent.inBrushDrag = true;
          s.brushStartCallback();
        })
        .on('drag', function (d) {
          const e = d3.event;
          const y = d.unitScaleInOrder(d.unitScale.invert(e.y));
          const s = d.brush.svgBrush;
          s.wasDragged = true;
          e.sourceEvent.stopPropagation();

          if (s.grabbingBar) {
            // moving the bar
            s.newExtent = [y - s.grabPoint, y + s.barLength - s.grabPoint].map(d.unitScaleInOrder.invert);
          } else {
            // south/north drag or new bar creation
            s.newExtent =
              d.unitScaleInOrder(s.startExtent) < y
                ? [s.startExtent, d.unitScaleInOrder.invert(y)]
                : [d.unitScaleInOrder.invert(y), s.startExtent];
          }

          // take care of the plom axis height constraint: bar can't breach it
          const bottomViolation = Math.max(0, -s.newExtent[0]);
          const topViolation = Math.max(0, s.newExtent[1] - 1);
          s.newExtent[0] += bottomViolation;
          s.newExtent[1] -= topViolation;
          if (s.grabbingBar) {
            // in case of bar dragging (non-resizing interaction, unlike north/south resize or new bar creation)
            // the constraint adjustment must apply to the other end of the bar as well, otherwise it'd
            // shorten or lengthen
            s.newExtent[1] += bottomViolation;
            s.newExtent[0] -= topViolation;
          }

          d.brush.filterSpecified = true;
          s.extent = s.newExtent;
          s.brushCallback(d);
          renderHighlight(this.parentElement);
        })
        .on('dragend', function (d) {
          const e = d3.event;
          e.sourceEvent.stopPropagation();
          const { brush } = d;
          const { filter } = brush;
          const s = brush.svgBrush;
          const { grabbingBar } = s;
          s.grabbingBar = false;
          s.grabLocation = undefined;
          d.parent.inBrushDrag = false;
          clearCursor(); // instead of clearing, a nicer thing would be to set it according to current location
          if (!s.wasDragged) {
            // a click+release on the same spot (ie. w/o dragging) means a bar or full reset
            s.wasDragged = undefined; // logic-wise unneded, just shows `wasDragged` has no longer a meaning
            if (grabbingBar) {
              s.extent = s.stayingIntervals;
              if (s.extent.length === 0) {
                brushClear(brush);
              }
            } else {
              brushClear(brush);
            }
            s.brushCallback(d);
            renderHighlight(this.parentElement);
            s.brushEndCallback(filter.get());
            return;
          }
          s.brushEndCallback(filter.get());
        }),
    );
};

const renderAxisBrush = (axisBrush) => {
  const background = axisBrush.selectAll('.background').data(repeat);

  background
    .enter()
    .append('rect')
    .classed('background', true)
    .call(barHorizontalSetup)
    .call(backgroundBarHorizontalSetup)
    .style('pointer-events', 'auto') // parent pointer events are disabled; we must have it to register events
    .attr('transform', `translate(0 ${VERTICAL_PADDING})`);

  background.call(attachDragBehavior).attr('height', (d) => d.height - VERTICAL_PADDING);

  const highlightShadow = axisBrush.selectAll('.highlightShadow').data(repeat); // we have a set here, can't call it `extent`

  highlightShadow
    .enter()
    .append('line')
    .classed('highlightShadow', true)
    .attr('x', -barConfig.fillWidth / 2)
    .attr('stroke-width', barConfig.fillWidth + barConfig.strokeWidth)
    .attr('stroke', barConfig.strokeColor)
    .attr('opacity', barConfig.strokeOpacity)
    .attr('stroke-linecap', 'butt');

  highlightShadow.attr('y1', (d) => d.height).call(styleHighlight);

  const highlight = axisBrush.selectAll('.highlight').data(repeat); // we have a set here, can't call it `extent`

  highlight
    .enter()
    .append('line')
    .classed('highlight', true)
    .attr('x', -barConfig.fillWidth / 2)
    .attr('stroke-width', barConfig.fillWidth - barConfig.strokeWidth)
    .attr('stroke', barConfig.fillColor)
    .attr('opacity', barConfig.fillOpacity)
    .attr('stroke-linecap', 'butt');

  highlight.attr('y1', (d) => d.height).call(styleHighlight);
};

const setAxisBrush = (axisBrush, root) => {
  axisBrush.each((d) => {
    // Set the brush programmatically if data requires so, eg. `constraintRange` specifies a proper subset
    // This is only to ensure the SVG brush is correct; WebGL lines are controlled from `d.brush.filter` directly
    const b = d.brush;
    const f = b.filter.get();
    if (filterActive(b)) {
      setBrushExtent(b, f);
    } else {
      brushClear(b, root);
    }
  });
};

/** @internal */
export const ensureAxisBrush = (axisOverlays) => {
  const axisBrush = axisOverlays.selectAll(`.${classNames.axisBrush}`).data(repeat, keyFun);

  const rotator = (d) =>
    d.special === 'top' || d.special === 'bottom'
      ? `rotate(90deg) translate(0, -110px)` // fixme magic offset for demo
      : `rotate(0)`;

  const axisBrushEnter = axisBrush.enter().append('g').classed(classNames.axisBrush, true).style('transform', rotator);

  const axisBrush2 = axisOverlays.selectAll(`.${classNames.axisBrush}2`).data(repeat, keyFun);

  axisBrush2.enter().append('g').classed(`${classNames.axisBrush}2`, true).style('transform', rotator);

  setAxisBrush(axisBrush, axisBrushEnter);
  renderAxisBrush(axisBrush2);
};

const setBrushExtent = (brush, range) => {
  brush.svgBrush.extent[0] = range[0];
  brush.svgBrush.extent[1] = range[1];
};

const getBrushExtent = (brush) => brush.svgBrush.extent;

const axisBrushMoved = (callback) => (dimension) => {
  const { brush } = dimension;
  const extent = getBrushExtent(brush);
  const newExtent = extent.slice();
  brush.filter.set(newExtent);
  callback();
};

const makeFilter = () => {
  let filter = [];
  return {
    set: (interval) => (filter = interval.slice()),
    get: () => filter.slice(),
  };
};

/** @internal */
export const makeBrush = (state, rangeSpecified, initialRange, brushStartCallback, brushCallback, brushEndCallback) => {
  const filter = makeFilter();
  filter.set(initialRange);
  return {
    filter,
    filterSpecified: rangeSpecified, // there's a difference between not filtering and filtering a non-proper subset
    svgBrush: {
      extent: [0, 1], // this is where the svgBrush writes contents into
      brushStartCallback,
      brushCallback: axisBrushMoved(brushCallback),
      brushEndCallback,
    },
  };
};

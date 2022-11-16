/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/* The below file has been partly derived from src/traces/parcoords/parcoords.js as of March 2018, commit
 * Original MIT license in the plotly.js repo as of 40b0c2bce9f8705e33c5badb6888131dcd74bf17
 * The file heavily depends on D3 DOM manipulation
 * todo: replace this file with a simple React tree and plain functions
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

import { resetState } from '../../../../common/kingly';
import { c, classNames, DARK_MODE, VERTICAL_PADDING } from '../src/config';
import { geomLayerMaker } from '../src/geoms';
import { keyFun, repeat, simulateContextLoss } from '../src/utils';
import { ensureAxisBrush, makeBrush } from './axis_brush';
import { domainScale, domainToUnitScale, unitScale, unitScaleInOrder, unitToColorScale } from './d3utils';

const GL_RENDER = true;
const AXIS_TITLE_OFFSET_Y = 30;
const DESIRED_TICK_DISTANCE_PX = 50;

const getModel = (config, i) => {
  const { colorPalette, line, domain, dimensions, screenDimensions: layout, canvasWidth, canvasHeight } = config;
  const groupWidth = Math.floor(layout.width * (domain.x[1] - domain.x[0]));
  const groupHeight = Math.floor(layout.height * (domain.y[1] - domain.y[0]));

  const pad = layout.margin;
  const rowContentWidth = groupWidth;
  const rowHeight = groupHeight;

  const visible = (d) => layout.visibleDimensions.has(d.label);
  return {
    key: i,
    rowCount: dimensions.filter(visible).length + 1, // the extra 1 is for parcoords
    colCount: dimensions.filter(visible).length,
    dimensions,
    tickDistance: DESIRED_TICK_DISTANCE_PX,
    unitToColor: unitToColorScale(colorPalette),
    line,
    layoutWidth: layout.width,
    layoutHeight: layout.height,
    domain,
    translateX: domain.x[0] * layout.width,
    translateY: layout.height - domain.y[1] * layout.height,
    pad,
    canvasWidth,
    canvasHeight,
    width: rowContentWidth,
    height: rowHeight,
    dpr: layout.dpr,
    visibleDimensions: layout.visibleDimensions,
  };
};

const getViewModel = (state, callbacks, config, i) => {
  const model = getModel(config, i);
  const { width } = model;
  const height = model.height / model.rowCount;
  const { dimensions } = model;

  const xScale = (d) => (width * d) / Math.max(1, model.colCount);
  const unitPad = VERTICAL_PADDING / height;
  const unitPadScale = 1 - 2 * unitPad;
  const paddedUnitScale = (d) => unitPad + unitPadScale * d;
  const uScaleInOrder = unitScaleInOrder(height, VERTICAL_PADDING);

  const viewModel = {
    key: model.key,
    xScale,
    model,
    inBrushDrag: false, // consider factoring it out and putting it in a centralized global-ish gesture state object
  };

  const uniqueKeys = {};

  const visible = (d) => model.visibleDimensions.has(d.label);

  viewModel.dimensions = dimensions.filter(visible).map((dim, i) => {
    const domainToUnit = domainToUnitScale(dim.values);
    const foundKey = uniqueKeys[dim.label];
    uniqueKeys[dim.label] = (foundKey || 0) + 1;
    const key = dim.label + (foundKey ? `__${foundKey}` : '');
    const uScale = unitScale(height, VERTICAL_PADDING);
    const specifiedConstraint = dim.constraintRange;
    const filterRangeSpecified = specifiedConstraint && specifiedConstraint.length > 0;
    const filterRange = filterRangeSpecified ? specifiedConstraint.map((d) => d.map(domainToUnit)) : [0, 1];
    const brushMove = () => GL_RENDER && viewModel.render(viewModel.panels, true);

    return {
      key,
      label: dim.label,
      tickFormat: dim.tickFormat,
      tickValues: dim.tickValues,
      tickLabels: dim.tickLabels,
      xIndex: i,
      crossfilterDimensionIndex: i,
      visibleIndex: dim.originalDimensionIndex,
      height,
      values: dim.values,
      paddedUnitValues: dim.values.map(domainToUnit).map(paddedUnitScale),
      xScale,
      x: xScale(i),
      canvasX: xScale(i),
      // fixme remove the old unitScale
      unitScale: uScale,
      unitScaleInOrder: uScaleInOrder,
      domainScale: domainScale(height, VERTICAL_PADDING, dim.values),
      domainScale2: domainScale(height * c.splomPanelSizeRatio * 1.035, VERTICAL_PADDING, dim.values),
      domainScale3: domainScale(-height * c.splomPanelSizeRatio * 0.95, VERTICAL_PADDING, dim.values),
      domainToUnitScale: domainToUnit,
      parent: viewModel,
      model,
      brush: makeBrush(
        state,
        filterRangeSpecified,
        filterRange,
        () => state.linePickActive(false),
        brushMove,
        (f) => {
          const p = viewModel;
          if (GL_RENDER) p.render(p.panels, true, true);
          state.linePickActive(true);
          if (callbacks && callbacks.filterChanged) {
            const invScale = domainToUnit.invert;
            const newRanges = f.map(invScale);
            callbacks.filterChanged(p.key, dim.originalDimensionIndex, newRanges); // invoke callback
          }
        },
      ),
    };
  });

  return viewModel;
};

const plomInteractionState = () => {
  let linePickActive = true;
  return {
    linePickActive: (d) => (typeof d === 'boolean' ? (linePickActive = Boolean(d)) : linePickActive),
  };
};

const updatePanelLayout = (dimAxis, vm) => {
  const panels = vm.panels || (vm.panels = new Map());
  // eslint-disable-next-line no-underscore-dangle
  const yAxes = dimAxis.each((d) => d)[vm.key].map((e) => e.__data__);
  const panelCount = yAxes.length;
  const rowCount = panelCount + 1;
  const assignPanelProps = (panel, renderLayer, p, row) => {
    const dim1 = yAxes[p];
    const dim2 = yAxes[row === 0 ? p + 1 : row - 1];
    // transposing the dimensions for the 2d panels as it feels more intuitive when brushing
    panel.dim1 = row === 0 ? dim1 : dim2;
    panel.dim2 = row === 0 ? dim2 : dim1;
    panel.canvasX = dim1.canvasX;
    panel.panelSizeX = yAxes[p + 1] ? yAxes[p + 1].canvasX - dim1.canvasX : dim1.xScale(p + 1) - dim1.canvasX;
    panel.panelSizeY = vm.model.height / rowCount;
    panel.y = row * panel.panelSizeY;
    panel.canvasY = vm.model.height - panel.y - panel.panelSizeY;
    panel.visible = true;
    panel.xIndex = p;
    panel.yIndex = row;
    panel.renderLayer = renderLayer;
    panel.zoomScale = vm.zoomScale;
    panel.zoomOffset = vm.zoomOffset;
  };
  for (let row = 0; row < rowCount; row++) {
    for (let p = 0; p < (row === 0 ? yAxes.length - 1 : yAxes.length); p++) {
      const gridColumn = p;
      const gridRow = row - 1;
      const renderLayerNames =
        row === 0 // combo: parcoords row
          ? ['parcoords', 'parcoordsPick']
          : gridColumn === gridRow
          ? ['binningRaster1d', 'binRanges1d', 'areaChart', 'panelBorder']
          : gridColumn < gridRow // lower triangle
          ? [
              'binningRaster2d',
              'binRanges2d',
              ...(c.hex ? ['hexHeatmapChart'] : ['heatmapChart']),
              ...(c.kernelDensity ? ['contours2d'] : []),
              'scatterPick',
              'panelBorder',
            ]
          : ['scatterplot', 'scatterPick', 'panelBorder']; // upper triangle
      const panelIndex = p + row * panelCount;
      renderLayerNames.forEach((renderLayerName) => {
        const key = `${panelIndex}_${renderLayerName}`;
        const panel = panels.get(key) || panels.set(key, {}).get(key);
        assignPanelProps(panel, renderLayerName, p, row);
      });
    }
  }
};

const verticalAxisSpecials = new Set(['left', 'right']);

const setupCanvas = (canvas, d, gl: WebGL2RenderingContext, viewModel, renderLayers, textures, attributes) => {
  d.gl = gl;

  const model = viewModel?.model ?? null;
  d.model = model;

  const ensureContextAndInitialRender = () => {
    resetState(d.gl);
    d.geomLayer = geomLayerMaker(d.gl, d.model, viewModel.dimensions, renderLayers, textures, attributes);
    viewModel.render = d.geomLayer.render;
    if (GL_RENDER) d.geomLayer.render(viewModel.panels, true, true);
  };

  ensureContextAndInitialRender();

  // handle context loss
  canvas.addEventListener('webglcontextlost', (event) => event.preventDefault(), false); // we could log it for telemetry etc todo add the option for a callback
  canvas.addEventListener(
    'webglcontextrestored',
    () => {
      // browser hack: the duplicate calling of ensureContextAndInitialRender and changing/resetting the width are needed for Chrome and Safari to properly restore the context upon loss
      // we could log context loss/regain for telemetry etc todo add the option for a callback
      ensureContextAndInitialRender();
      const widthCss = canvas.style.width;
      const widthNum = parseFloat(widthCss);
      canvas.style.width = `${widthNum + 0.1}px`;
      window.setTimeout(() => {
        canvas.style.width = widthCss;
        ensureContextAndInitialRender();
      }, 0);
    },
    false,
  );

  if (c.glTestContextLoss) simulateContextLoss(d.gl);
};

const renderPlomControlOverlay = (svg, viewModels, toggleLinePickRendering, axisMovedCallback) => {
  const plomControlOverlay = svg.selectAll(`.${classNames.plom}`).data(viewModels, keyFun);

  plomControlOverlay.exit().remove();

  plomControlOverlay
    .enter()
    .append('g')
    .classed(classNames.plom, true)
    .attr('overflow', 'visible')
    .style('box-sizing', 'content-box')
    .style('position', 'absolute')
    .style('left', 0)
    .style('overflow', 'visible')
    .style('shape-rendering', 'crispEdges')
    .style('pointer-events', 'none');

  plomControlOverlay
    .attr('width', (d) => d.model.width + d.model.pad.l + d.model.pad.r)
    .attr('height', (d) => d.model.height / d.model.rowCount + d.model.pad.t + d.model.pad.b)
    .attr('transform', (d) => `translate(${d.model.translateX}, ${d.model.translateY})`);

  const plomControlView = plomControlOverlay.selectAll(`.${classNames.plomControlView}`).data(repeat, keyFun);

  plomControlView.enter().append('g').classed(classNames.plomControlView, true).style('box-sizing', 'content-box');

  plomControlView.attr('transform', (d) => `translate(${d.model.pad.l}, ${d.model.pad.t})`);

  const dimAxis = plomControlView.selectAll(`.${classNames.dimAxis}`).data((vm) => vm.dimensions, keyFun);

  dimAxis.enter().append('g').classed(classNames.dimAxis, true);

  plomControlView.each((vm) => updatePanelLayout(dimAxis, vm));

  const axisTransformFunction = (d) =>
    d.special === 'left' || d.special === 'right'
      ? `translate(0, ${d.xScale(d.xIndex) + d.xIndex * 7.4})`
      : d.special === 'top' || d.special === 'bottom'
      ? `translate(${d.xScale(d.xIndex) + 104}, 0)`
      : `translate(${d.xScale(d.xIndex)}, 0)`;

  dimAxis.attr('transform', axisTransformFunction);

  const horizontalAxisDrag = (d, selection) => {
    const p = d.parent;
    toggleLinePickRendering(false);
    d.x = Math.max(0, Math.min(d.model.width, d3.event.x));
    d.canvasX = d.x;
    dimAxis
      .sort((a, b) => a.x - b.x)
      .each((dd, i) => {
        dd.xIndex = i;
        dd.x = d === dd ? dd.x : dd.xScale(dd.xIndex);
        dd.canvasX = dd.x;
      });

    updatePanelLayout(dimAxis, p);

    dimAxis.filter((dd) => Math.abs(d.xIndex - dd.xIndex) !== 0).attr('transform', axisTransformFunction);
    selection.attr('transform', `translate(${d.x}, 0)`);
    dimAxis.each((dd, i, ii) => {
      if (ii === d.parent.key) p.dimensions[i] = dd;
    });
    if (GL_RENDER) p.render(p.panels, true);
  };

  const horizontalAxisDragEnd = (d, selection) => {
    const p = d.parent;
    d.x = d.xScale(d.xIndex);
    d.canvasX = d.x;
    updatePanelLayout(dimAxis, p);
    selection.attr('transform', (d) => `translate(${d.x}, 0)`);
    if (GL_RENDER) p.render(p.panels, true, true);
    toggleLinePickRendering(true);

    axisMovedCallback(
      p.key,
      p.dimensions.map((dd) => dd.crossfilterDimensionIndex),
      p.model,
    );
  };

  const verticalAxisDrag = () => {}; // noop: not supported yet
  const verticalAxisDragEnd = () => {}; // noop: not supported yet

  dimAxis.call(
    d3.behavior
      .drag()
      .origin((d) => d)
      .on('drag', function (d) {
        return verticalAxisSpecials.has(d.special)
          ? verticalAxisDrag(d, d3.select(this))
          : horizontalAxisDrag(d, d3.select(this));
      })
      .on('dragend', function (d) {
        return verticalAxisSpecials.has(d.special)
          ? verticalAxisDragEnd(d, d3.select(this))
          : horizontalAxisDragEnd(d, d3.select(this));
      }),
  );

  dimAxis.on('wheel', function (d) {
    const p = d.parent;
    const e = d3.event;

    const { y } = e;
    const panelHeight = d.height;
    const topMargin = 153;
    const yIndex = Math.min(6, Math.max(0, Math.floor((y - topMargin) / panelHeight)));
    const inPanelY = y - topMargin - yIndex * panelHeight;

    if (!p.zoomOffset) p.zoomOffset = [0, 0];
    p.zoomOffset[0] = 0;
    p.zoomOffset[1] = panelHeight - inPanelY;

    if (!p.zoomScale) p.zoomScale = [1.001, 1.001];
    p.zoomScale[0] *= 1 + e.wheelDelta / 5000;
    p.zoomScale[1] *= 1 + e.wheelDelta / 5000;
    updatePanelLayout(dimAxis, p);
    if (GL_RENDER) p.render(p.panels, true);
  });

  dimAxis.exit().remove();

  const axisOverlays = dimAxis.selectAll(`.${classNames.axisOverlays}`).data(repeat, keyFun);

  axisOverlays.enter().append('g').classed(classNames.axisOverlays, true);

  axisOverlays.selectAll(`.${classNames.axis}`).remove();

  const axis = axisOverlays.selectAll(`.${classNames.axis}`).data(repeat, keyFun);

  axis.enter().append('g').classed(classNames.axis, true);

  axis.each(function (d) {
    const wantedTickCount = d.model.height / d.model.rowCount / d.model.tickDistance;
    const scale =
      d.special === 'left' || d.special === 'right'
        ? d.domainScale2
        : d.special === 'top' || d.special === 'bottom'
        ? d.domainScale3
        : d.domainScale;
    d3.select(this).call(
      d3.svg
        .axis()
        .orient(
          d.special === 'right' ? 'right' : d.special === 'top' ? 'top' : d.special === 'bottom' ? 'bottom' : 'left',
        )
        .tickSize(4)
        .outerTickSize(2)
        .ticks(wantedTickCount, d.tickFormat) // works for continuous scales only...
        .tickValues(null)
        .tickFormat(null)
        .scale(scale),
    );
  });

  axis
    .selectAll('.domain, .tick>line')
    .attr('fill', 'none')
    .attr('stroke', DARK_MODE ? '#999' : '#999')
    .attr('stroke-opacity', 1)
    .attr('stroke-width', '1px');

  axis
    .selectAll('text')
    // interactions
    .style('cursor', 'default')
    .style('user-select', 'none')

    // text color
    .style('fill', DARK_MODE ? 'white' : 'black')

    // make text readable with an inverse outline
    .style('stroke', DARK_MODE ? 'black' : 'rgba(255,255,255,0.75)')
    .style('paint-order', 'stroke')
    .style('stroke-width', '2px')
    .style('stroke-linecap', 'butt')
    .style('stroke-linejoin', 'miter');

  const axisHeading = axisOverlays.selectAll(`.${classNames.axisHeading}`).data(repeat, keyFun);

  axisHeading
    .enter()
    .append('g')
    .classed(classNames.axisHeading, true)
    .style('fill', DARK_MODE ? 'white' : 'black');

  const axisTitle = axisHeading.selectAll(`.${classNames.axisTitle}`).data(repeat, keyFun);

  axisTitle
    .enter()
    .append('text')
    .classed(classNames.axisTitle, true)
    .attr('text-anchor', 'middle')
    .style('cursor', (d) => (verticalAxisSpecials.has(d.special) ? 'normal' : 'ew-resize')) // vertical drag not yet supported
    .style('user-select', 'none')
    .style('pointer-events', 'auto');

  axisTitle
    .attr('transform', (d) =>
      d.special === 'left'
        ? 'rotate(-90) translate(-57, -50)'
        : d.special === 'right'
        ? 'rotate(90) translate(57, -46)'
        : d.special === 'bottom'
        ? `translate(-52, ${AXIS_TITLE_OFFSET_Y + 9})`
        : d.special === 'top'
        ? `translate(-52, ${-AXIS_TITLE_OFFSET_Y})`
        : `translate(0, ${-AXIS_TITLE_OFFSET_Y + 12})`,
    )
    .text((d) => d.label);

  ensureAxisBrush(axisOverlays);
};

let lastHovered = null;

const handleMouseMove = (render, hover, unhover, canvasWidth, canvasHeight, key, readPixel, clientX, clientY, x, y) => {
  if (x < 0 || y < 0 || x >= canvasWidth || y >= canvasHeight) return;
  const pixel = readPixel(canvasHeight, x, y);
  const found = pixel[3] !== 0;
  // inverse of the calcPickColor in `lines.js`; detailed comment there
  const datumIndex = found ? pixel[2] + 256 * (256 * pixel[0] + pixel[1]) : null;
  const eventData = { x, y, clientX, clientY, dataIndex: key, datumIndex };

  render(datumIndex); // rendering even if point not found, to remove previous point hover effect

  if (datumIndex !== lastHovered) {
    // don't unnecessarily repeat the same hit (or miss)
    if (found) {
      hover(eventData);
    } else if (unhover) {
      unhover(eventData);
    }
    lastHovered = datumIndex;
  }
};

const plom = (gl, svg, plomGeomCanvas, configs, renderLayers, textures, attributes, callbacks) => {
  const state = plomInteractionState();

  const viewModels = configs
    .filter((d) => d.visible !== false)
    .map((config, i) => getViewModel(state, callbacks, config, i));

  const viewModel = viewModels[0];

  // emit hover / unhover event
  plomGeomCanvas.on('mousemove', function (d) {
    if (!state.linePickActive() || !d.geomLayer || !callbacks?.hover) return;
    const [x, y] = d3.mouse(this);
    const { canvasWidth, canvasHeight, key } = d.model;
    const { clientX, clientY } = d3.event;
    const { readPixel } = d.geomLayer;
    const { hover, unhover } = callbacks;
    const render = (pointId) => {
      d.geomLayer.render(viewModel.panels, true, false, pointId);
    };
    handleMouseMove(render, hover, unhover, canvasWidth, canvasHeight, key, readPixel, clientX, clientY, x, y);
  });

  const vmSplomLeft = {
    ...viewModel,
    key: 1,
    dimensions: viewModel.dimensions.map((dim) => ({ ...dim, special: 'left' })),
    model: {
      ...viewModel.model,
      pad: {
        ...viewModel.model.pad,
        l: 120,
        t: 192 - 41,
        b: -80,
      },
    },
  };

  const vmSplomRight = {
    ...viewModel,
    key: 2,
    dimensions: viewModel.dimensions.map((dim) => ({ ...dim, special: 'right' })),
    model: {
      ...viewModel.model,
      pad: {
        ...viewModel.model.pad,
        l: 932,
        t: 192 - 41,
        b: -80,
      },
    },
  };

  const vmSplomTop = {
    ...viewModel,
    key: 3,
    dimensions: viewModel.dimensions.map((dim) => ({ ...dim, special: 'top' })),
    model: {
      ...viewModel.model,
      pad: {
        ...viewModel.model.pad,
        l: 120 + 10,
        t: 192 - 41 - 10 + 1,
        b: -80,
      },
    },
  };

  const vmSplomBottom = {
    ...viewModel,
    key: 4,
    dimensions: viewModel.dimensions.map((dim) => ({ ...dim, special: 'bottom' })),
    model: {
      ...viewModel.model,
      pad: {
        ...viewModel.model.pad,
        l: 120 + 10,
        t: 1008,
        b: -80,
      },
    },
  };

  const extendedViewModels = [viewModel, vmSplomLeft, vmSplomRight, vmSplomTop, vmSplomBottom];

  renderPlomControlOverlay(svg, extendedViewModels, state.linePickActive, callbacks.axisMoved);

  plomGeomCanvas.each(function (d) {
    setupCanvas(this, d, gl, viewModel, renderLayers, textures, attributes);
  });
};

/** @internal */
export const renderPlom = (
  gl: WebGL2RenderingContext,
  svgElement,
  glCanvasElement,
  emit,
  configs,
  { renderLayers, attributes },
  textures,
) => {
  const svg = d3.select(svgElement);
  const plomGeomCanvas = d3.select(glCanvasElement).data([[{ key: 'focusLayer' }]]);

  //  const data = [[{ key: 'focusLayer' }]];
  //  const svg = d3.selectAll(d3.select(svgElement)).data(data);
  //  const plomGeomCanvas = d3.selectAll(d3.select(glCanvas)).data(data);

  const dimensionsArray = configs.map((vm) => vm.dimensions);
  const dimensionsArrayOriginalOrder = dimensionsArray.map((dimensions) => dimensions.slice());

  const filterChanged = (i, originalDimensionIndex, newRanges) => {
    const dimension = dimensionsArrayOriginalOrder[i][originalDimensionIndex];
    dimension.constraintRange = newRanges.slice();
    emit('Filter Changed');
  };

  const hover = (eventData) => emit('Hovered', eventData);
  const unhover = (eventData) => emit('Unhovered', eventData);
  const axisMoved = (i, visibleIndices, layout) => {
    const visible = (d) => layout.visibleDimensions.has(d.label);
    const newIdx = (visibleIndices, orig, dim) => {
      const origIndex = orig.indexOf(dim);
      let currentIndex = visibleIndices.indexOf(origIndex);
      if (currentIndex === -1) {
        // invisible dimensions initially go to the end
        currentIndex += orig.length;
      }
      return currentIndex;
    };

    const sorter = (orig) => (d1, d2) => newIdx(visibleIndices, orig, d1) - newIdx(visibleIndices, orig, d2);

    // drag&drop sorting of the visible dimensions
    const orig = sorter(dimensionsArrayOriginalOrder[i].filter(visible));
    dimensionsArray[i].sort(orig);

    // invisible dimensions are not interpreted in the context of drag&drop sorting as an invisible dimension
    // cannot be dragged; they're interspersed into their original positions by this subsequent merging step
    dimensionsArrayOriginalOrder[i]
      .filter((d) => !visible(d))
      .sort((d) => dimensionsArrayOriginalOrder[i].indexOf(d))
      .forEach((d) => {
        dimensionsArray[i].splice(dimensionsArray[i].indexOf(d), 1); // remove from the end
        dimensionsArray[i].splice(dimensionsArrayOriginalOrder[i].indexOf(d), 0, d); // insert at original index
      });

    emit('Axis Moved');
  };

  plom(gl, svg, plomGeomCanvas, configs, renderLayers, textures, attributes, {
    filterChanged,
    hover,
    unhover,
    axisMoved,
  });
};

/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { NOOP } from './constants';
import { getActiveCursor } from './hover_pin';
import { setupEventHandlers, teardownEventHandlers } from './interactions';
import { getPipeline } from './pipeline';
import { TraceCanvasController } from './trace_canvas_controller';
import type { TraceControllerDeps, TraceProps } from './types';
import { DEFAULT_CSS_CURSOR } from '../../../common/constants';
import type { AnnotationLayoutItem, BadgeLayoutItem } from '../render/types';
import type { TraceDatum, TraceSpec } from '../trace_api';

/**
 * These tests cover only the NEW seams introduced by the controller extraction (ADR 0004 Decision 5):
 * the listener attach/detach lifecycle, the pure view-state getters, and the pipeline memoization.
 * End-to-end behavior (all 100+ gestures/callbacks) stays covered by `trace_chart.test.tsx`.
 */

function makeController(getProps: () => TraceProps, canvas: HTMLCanvasElement | null = null): TraceCanvasController {
  const deps: TraceControllerDeps = {
    getProps,
    getCanvas: () => canvas,
    getContainer: () => null,
    getAriaLive: () => null,
    requestRender: () => {},
  };
  return new TraceCanvasController(deps);
}

describe('TraceCanvasController — listener lifecycle', () => {
  it('attaches every canvas listener and assigns the handler fields on setup', () => {
    const canvas = document.createElement('canvas');
    const addSpy = jest.spyOn(canvas, 'addEventListener');
    const c = makeController(() => ({}) as TraceProps, canvas);

    setupEventHandlers(c);

    expect(addSpy).toHaveBeenCalledWith('wheel', expect.any(Function), expect.objectContaining({ passive: false }));
    expect(c.handleWheel).toEqual(expect.any(Function));
    expect(c.handleKeyDown).toEqual(expect.any(Function));
    expect(c.handleTouchStart).toEqual(expect.any(Function));
    // Definite-assignment pin handlers are wired too.
    expect(c.handleKeyUp).toEqual(expect.any(Function));
    expect(c.handleUnpinningTooltip).toEqual(expect.any(Function));

    teardownEventHandlers(c);
  });

  it('detaches exactly the canvas listeners it attached', () => {
    const canvas = document.createElement('canvas');
    const addSpy = jest.spyOn(canvas, 'addEventListener');
    const removeSpy = jest.spyOn(canvas, 'removeEventListener');
    const c = makeController(() => ({}) as TraceProps, canvas);

    setupEventHandlers(c);
    teardownEventHandlers(c);

    // Symmetric: every canvas addEventListener has a matching removeEventListener.
    expect(removeSpy.mock.calls.length).toBe(addSpy.mock.calls.length);
    expect(removeSpy).toHaveBeenCalledWith('wheel', c.handleWheel);
  });

  it('is safe to tear down twice (idempotent double-detach)', () => {
    const canvas = document.createElement('canvas');
    const c = makeController(() => ({}) as TraceProps, canvas);

    setupEventHandlers(c);
    teardownEventHandlers(c);
    expect(() => teardownEventHandlers(c)).not.toThrow();
  });

  it('no-ops setup/teardown when there is no canvas', () => {
    const c = makeController(() => ({}) as TraceProps, null);
    expect(() => setupEventHandlers(c)).not.toThrow();
    expect(c.handleWheel).toBeNull();
    expect(() => teardownEventHandlers(c)).not.toThrow();
  });
});

describe('TraceCanvasController — view-state getters', () => {
  const interactiveProps = () => ({ onElementClick: () => {} }) as unknown as TraceProps;
  const nonInteractiveProps = () => ({ onElementClick: NOOP }) as unknown as TraceProps;

  it('tweenDomain reflects the tween fields', () => {
    const c = makeController(nonInteractiveProps);
    c.tween = { niceDomainMin: 5, niceDomainMax: 9 };
    expect(c.tweenDomain).toEqual({ min: 5, max: 9 });
  });

  it('span hover shows a pointer cursor regardless of onElementClick', () => {
    const c = makeController(nonInteractiveProps);
    c.hover.index = 2;
    c.hover.region = 'active';
    expect(getActiveCursor(c)).toBe('pointer');
    expect(c.getCursor()).toBe('pointer');
  });

  it('empty region is not a pointer', () => {
    const c = makeController(nonInteractiveProps);
    c.hover.index = 2;
    c.hover.region = 'empty';
    expect(getActiveCursor(c)).toBe(DEFAULT_CSS_CURSOR);
  });

  it('hovered badge/annotation are only interactive when onElementClick is wired', () => {
    const badge = { id: 'b', item: {} as BadgeLayoutItem, span: {} };

    const wired = makeController(interactiveProps);
    wired.hoveredBadge = { spanId: 's', badgeId: 'b', laneIndex: 0, item: badge.item, span: {} as never };
    expect(getActiveCursor(wired)).toBe('pointer');

    const notWired = makeController(nonInteractiveProps);
    notWired.hoveredBadge = { spanId: 's', badgeId: 'b', laneIndex: 0, item: badge.item, span: {} as never };
    expect(getActiveCursor(notWired)).toBe(DEFAULT_CSS_CURSOR);

    const wiredAnnotation = makeController(interactiveProps);
    wiredAnnotation.hoveredAnnotation = { id: 'a', item: {} as AnnotationLayoutItem };
    expect(getActiveCursor(wiredAnnotation)).toBe('pointer');
  });
});

describe('TraceCanvasController — pipeline memoization', () => {
  const vizColors = ['#54B399', '#6092C0'];
  const props = () => ({ theme: { colors: { vizColors } } }) as unknown as TraceProps;
  const makeSpec = (data: TraceDatum[]): TraceSpec => ({ data, xScaleType: 'linear' }) as unknown as TraceSpec;

  it('returns the same cached result for the same spec (cache hit)', () => {
    const c = makeController(props);
    const spec = makeSpec([{ id: 'a', name: 'a', start: 0, end: 10 }]);
    const first = getPipeline(c, spec);
    const second = getPipeline(c, spec);
    expect(second).toBe(first);
  });

  it('recomputes and refreshes spanIdToLane when the data reference changes (cache miss)', () => {
    const c = makeController(props);
    const first = getPipeline(c, makeSpec([{ id: 'a', name: 'a', start: 0, end: 10 }]));
    const second = getPipeline(c, makeSpec([{ id: 'a', name: 'a', start: 0, end: 10 }]));
    expect(second).not.toBe(first);
    expect(c.spanIdToLane.get('a')).toBe(0);
  });
});

/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { memo } from 'react';
import { connect } from 'react-redux';

import { buildTraceAnnotationEvent } from './tooltip';
import type { ResolvedTraceAnnotation } from '../data/annotations';
import {
  getResolvedTraceAnnotationsSelector,
  getTraceAnnotationClickHandlerSelector,
} from '../state/selectors/get_screen_reader_data';
import type { GlobalChartState } from '../../../state/chart_state';
import { getInternalIsInitializedSelector, InitStatus } from '../../../state/selectors/get_internal_is_intialized';
import type { TraceSpec } from '../trace_api';

interface ScreenReaderTraceAnnotationsProps {
  annotations: ResolvedTraceAnnotation[];
  onAnnotationClick: TraceSpec['onAnnotationClick'];
}

/** Human-readable label for an annotation kind, used in the SR "Type" column. */
const KIND_LABEL: Record<ResolvedTraceAnnotation['kind'], string> = {
  time: 'Time',
  lane: 'Lane',
  hierarchy: 'Hierarchy',
};

/** The related span's name for lane/hierarchy annotations; blank for time annotations. */
function relatedSpanName(annotation: ResolvedTraceAnnotation): string {
  return annotation.kind === 'time' ? '—' : annotation.span.name;
}

/**
 * A **separate** screen-reader `<table>` listing the resolved Trace annotations (Spec 29), rendered
 * after `ScreenReaderTraceTable` in the same `<figure>`. Kept out of the span rows so AT can browse
 * annotations as their own structured surface (columns: Name, Type, Related span). Each entry uses its
 * accessible name (a generated fallback when the author omitted one — also reported via diagnostics).
 * With an `onAnnotationClick` handler, entries are keyboard-activatable `<button tabIndex={-1}>`s that
 * dispatch a `keyboard`-source event (never synthesizing hover); without one they are inert text.
 * Renders nothing when no annotation resolves.
 * @internal
 */
export const ScreenReaderTraceAnnotationsComponent = ({
  annotations,
  onAnnotationClick,
}: ScreenReaderTraceAnnotationsProps) => {
  if (annotations.length === 0) return null;

  return (
    <div
      className="echScreenReaderOnly echScreenReaderTable"
      data-testid="echScreenReaderTraceAnnotations"
    >
      <table>
        <caption>{`The table lists the ${annotations.length} annotation${
          annotations.length !== 1 ? 's' : ''
        } on this trace`}</caption>
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Type</th>
            <th scope="col">Related span</th>
          </tr>
        </thead>
        <tbody>
          {annotations.map((annotation) => (
            <tr key={annotation.id} tabIndex={-1}>
              <th scope="row">
                {onAnnotationClick ? (
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => onAnnotationClick(buildTraceAnnotationEvent(annotation, 'keyboard'))}
                  >
                    {annotation.ariaLabel}
                  </button>
                ) : (
                  annotation.ariaLabel
                )}
              </th>
              <td>{KIND_LABEL[annotation.kind]}</td>
              <td>{relatedSpanName(annotation)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const DEFAULT_PROPS: ScreenReaderTraceAnnotationsProps = {
  annotations: [],
  onAnnotationClick: undefined,
};

const mapStateToProps = (state: GlobalChartState): ScreenReaderTraceAnnotationsProps => {
  if (getInternalIsInitializedSelector(state) !== InitStatus.Initialized) {
    return DEFAULT_PROPS;
  }
  return {
    annotations: getResolvedTraceAnnotationsSelector(state),
    onAnnotationClick: getTraceAnnotationClickHandlerSelector(state),
  };
};

/** @internal */
export const ScreenReaderTraceAnnotations = memo(connect(mapStateToProps)(ScreenReaderTraceAnnotationsComponent));

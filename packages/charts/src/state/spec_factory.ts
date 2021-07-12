/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { useEffect } from 'react';
import { connect } from 'react-redux';
import { Dispatch, bindActionCreators } from 'redux';

import { Spec } from '../specs';
import { upsertSpec, removeSpec } from './actions/specs';

/** @internal */
export interface DispatchProps {
  upsertSpec: (spec: Spec) => void;
  removeSpec: (id: string) => void;
}

/** @internal */
export function specComponentFactory<U extends Spec, D extends keyof U>(
  defaultProps: Pick<U, D | 'chartType' | 'specType'>,
) {
  /* eslint-disable no-shadow, react-hooks/exhaustive-deps, unicorn/consistent-function-scoping */
  const SpecInstance = (props: U & DispatchProps) => {
    const { removeSpec, upsertSpec, ...SpecInstance } = props;
    useEffect(() => {
      upsertSpec(SpecInstance);
    });
    useEffect(
      () => () => {
        removeSpec(props.id);
      },
      [],
    );
    return null;
  };
  /* eslint-enable */
  SpecInstance.defaultProps = defaultProps;
  return SpecInstance;
}

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps =>
  bindActionCreators(
    {
      upsertSpec,
      removeSpec,
    },
    dispatch,
  );

/** @internal */
export function getConnect() {
  /**
   * Redux assumes shallowEqual for all connected components
   *
   * This causes an issue where the specs are cleared and memoized spec components will never be
   * re-rendered and thus never re-upserted to the state. Setting pure to false solves this issue
   * and doesn't cause traditional performance degradations.
   */
  return connect(null, mapDispatchToProps, null, { pure: false });
}

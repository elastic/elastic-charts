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
import { isObject } from '../utils/common';
import { upsertSpec as upsertSpecAction, removeSpec as removeSpecAction } from './actions/specs';

/** @internal */
export interface DispatchProps {
  upsertSpec: typeof upsertSpecAction;
  removeSpec: typeof removeSpecAction;
}

/**
 * Get default factory props type
 * @internal */
export type DefaultFactorProps<S extends Spec, Props extends keyof S> = Pick<S, Props | 'chartType' | 'specType'>;

/**
 * Spec instance factory
 * @param defaultProps
 * @param deepDefaults objects to do a shallow spread
 * @returns spec instance Component
 * @internal
 */
export function specComponentFactory<S extends Spec, Props extends keyof S>(
  defaultProps: DefaultFactorProps<S, Props>,
  deepDefaults: (keyof DefaultFactorProps<S, Props>)[] = [],
) {
  /* eslint-disable no-shadow, react-hooks/exhaustive-deps, unicorn/consistent-function-scoping */
  const SpecInstance = (props: S & DispatchProps) => {
    const { removeSpec, upsertSpec, ...SpecInstance } = props;

    useEffect(() => {
      upsertSpec({
        ...SpecInstance,
        ...deepDefaults.reduce((acc, k) => {
          const key = k as keyof typeof SpecInstance;
          if (SpecInstance && isObject(SpecInstance[key])) {
            acc[key] = { ...defaultProps, ...props[key] } as any;
          }
          return acc;
        }, {} as any),
      });
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
      upsertSpec: upsertSpecAction,
      removeSpec: removeSpecAction,
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

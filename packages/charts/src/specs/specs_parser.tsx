/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { FC, PropsWithChildren } from 'react';
import { useEffect } from 'react';
import { connect } from 'react-redux';
import type { Dispatch } from 'redux';
import { bindActionCreators } from 'redux';

import { specParsed, specUnmounted } from '../state/actions/specs';

const SpecsParserComponent: FC<PropsWithChildren<DispatchProps>> = (props) => {
  const injected = props as DispatchProps;
  // clean all specs
  useEffect(() => {
    injected.specParsed();
  });
  useEffect(
    () => () => {
      injected.specUnmounted();
    },
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );
  // TODO eliminate the need for this type casting
  return props.children ? (props.children as React.ReactElement) : null;
};

interface DispatchProps {
  specParsed: () => void;
  specUnmounted: () => void;
}

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps =>
  bindActionCreators(
    {
      specParsed,
      specUnmounted,
    },
    dispatch,
  );

/**
 * The Spec Parser component
 * @internal
 */
export const SpecsParser = connect(null, mapDispatchToProps)(SpecsParserComponent);

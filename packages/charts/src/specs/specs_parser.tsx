/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Dispatch } from '@reduxjs/toolkit';
import { bindActionCreators } from '@reduxjs/toolkit';
import type { FC, PropsWithChildren } from 'react';
import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import { specParsed, specUnmounted } from '../state/actions/specs';
import { isServerSide } from '../utils/common';

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
  if (isServerSide()) {
    return (
      <>
        {props.children}
        <ServerSpecsParsed onRender={injected.specParsed} />
      </>
    );
  }
  // TODO eliminate the need for this type casting
  return props.children ? (props.children as React.ReactElement) : null;
};

/** Rendered after the specs, so on the server it runs once every spec has registered itself. */
const ServerSpecsParsed: FC<{ onRender: () => void }> = ({ onRender }) => {
  onRender();
  return null;
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

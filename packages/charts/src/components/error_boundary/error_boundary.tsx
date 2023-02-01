/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { Component, ReactNode } from 'react';

import { isGracefulError } from './errors';
import { SettingsSpec } from '../../specs/settings';
import { NoResults } from '../no_results';

type ErrorBoundaryProps = {
  children: ReactNode;
  renderFn?: SettingsSpec['noResults'];
};

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Error Boundary to catch and handle custom errors
 * @internal
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  hasError = false;

  componentDidUpdate() {
    if (this.hasError) {
      this.hasError = false;
    }
  }

  componentDidCatch(error: Error) {
    if (isGracefulError(error)) {
      this.hasError = true;
      this.forceUpdate();
    }
  }

  render() {
    if (this.hasError) {
      return <NoResults renderFn={this.props.renderFn} />;
    }

    return this.props.children;
  }
}

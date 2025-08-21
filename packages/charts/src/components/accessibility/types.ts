/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/**
 * Generic interface for chart label data
 * @internal
 */
export interface ChartLabelData {
  /** Primary label for the chart */
  primaryLabel?: string;
  /** Secondary label for additional context */
  secondaryLabel?: string;
}

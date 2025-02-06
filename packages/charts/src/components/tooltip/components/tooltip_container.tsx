/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import React, { PropsWithChildren } from 'react';

import { useTooltipContext } from './tooltip_provider';
import { SeriesIdentifier } from '../../../common/series_id';
import { BaseDatum } from '../../../specs';
import { Datum, renderComplexChildren } from '../../../utils/common';

/** @public */
export const TooltipContainer = <D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier>(
  props: PropsWithChildren<{ className?: string }>,
) => {
  const { pinned } = useTooltipContext<D, SI>();
  return (
    <div className={classNames('echTooltip', props.className, { 'echTooltip--pinned': pinned })}>
      {renderComplexChildren(props.children)}
    </div>
  );
};

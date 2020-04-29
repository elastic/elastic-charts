/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License. */

import React, { forwardRef } from 'react';

import { AnnotationTooltipFormatter } from '../../../annotations/types';

interface RectAnnotationTooltipProps {
  details?: string;
  customTooltip?: AnnotationTooltipFormatter;
}

/** @internal */
export const RectAnnotationTooltip = forwardRef(function RectAnnotationTooltipRender(
  props: RectAnnotationTooltipProps,
  ref: React.Ref<HTMLDivElement>,
) {
  const { details, customTooltip } = props;
  const tooltipContent = customTooltip ? customTooltip(details) : details;
  if (!tooltipContent) {
    return null;
  }
  return (
    <div className="echAnnotation__tooltip" ref={ref}>
      <div className="echAnnotation__details">
        <div className="echAnnotation__detailsText">{tooltipContent}</div>
      </div>
    </div>
  );
});

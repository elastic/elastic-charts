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
 * under the License.
 */

import { stringToRGB } from '../../../../../common/color_library_wrappers';
import { Point } from '../../../../../utils/point';
import { PanelGeoms } from '../../../state/selectors/compute_panels';
import { renderRect } from '../primitives/rect';

/** @internal */
export function renderGridPanels(ctx: CanvasRenderingContext2D, { x: chartX, y: chartY }: Point, panels: PanelGeoms) {
  panels.forEach(({ width, height, panelAnchor: { x: panelX, y: panelY } }) =>
    withContext(ctx, (ctx) =>
      renderRect(
        ctx,
        { x: chartX + panelX, y: chartY + panelY, width, height },
        { color: stringToRGB('#00000000') },
        { color: stringToRGB('#000000'), width: 1 },
      ),
    ),
  );
}

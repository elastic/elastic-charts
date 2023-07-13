/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import { boolean, button } from '@storybook/addon-knobs';
import { useEffect, useCallback, useState } from 'react';

import { ElementClickListener, HeatmapBrushEvent, HeatmapElementEvent, HeatmapHighlightedData } from '@elastic/charts';

export const useHeatmapSelection = (disableActions = false) => {
  const [selection, setSelection] = useState<HeatmapHighlightedData | undefined>();
  const clearSelection = useCallback(() => setSelection(undefined), []);
  const onElementClick: ElementClickListener = useCallback(
    (e) => {
      if (!disableActions) action('onElementClick')(e);
      const { x, y, smHorizontalAccessorValue, smVerticalAccessorValue } = (e as HeatmapElementEvent[])[0][0].datum;
      setSelection({
        x: [x],
        y: [y],
        smHorizontalAccessorValue,
        smVerticalAccessorValue,
      });
    },
    [disableActions],
  );
  const onBrushEnd = useCallback(
    (e) => {
      if (!disableActions) action('brushEvent')(e);
      setSelection(e as HeatmapBrushEvent);
    },
    [disableActions],
  );
  useEffect(() => {
    document.addEventListener('keyup', ({ key }) => {
      if (key === 'Escape') clearSelection();
    });
  }, [clearSelection]);

  const persistCellsSelection = boolean('Persist cells selection', true);
  button('Clear cells selection', clearSelection);

  return {
    selection,
    setSelection,
    onBrushEnd,
    onElementClick,
    clearSelection,
    highlightedData: persistCellsSelection ? selection : undefined,
  };
};

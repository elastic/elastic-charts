/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import React, { useCallback } from 'react';

import { LegendTableCell } from './legend_table_cell';
import { LegendTableRow } from './legend_table_row';
import { LegendValueComponent } from './legend_value';
import type { SeriesIdentifier } from '../../../common/series_id';
import { LayoutDirection } from '../../../utils/common';
import { Label as ItemLabel } from '../label';
import { useLegendColorPicker } from '../legend_color_picker';
import type { LegendItemProps } from '../legend_item';
import { prepareLegendValues } from '../legend_item';

/** @internal */
export const LegendListItem: React.FC<LegendItemProps> = (props) => {
  const {
    extraValues,
    item,
    legendValues,
    totalItems,
    action: Action,
    showActionAlways = false,
    positionConfig,
    labelOptions,
    isMostlyRTL,
    onClick,
    toggleDeselectSeriesAction,
    onLegendItemMouseOver,
    onLegendItemMouseOut,
    hiddenItems,
  } = props;
  const { color, isSeriesHidden, isItemHidden, seriesIdentifiers, label, path, isToggleable } = item;

  const itemClassNames = classNames('echLegendTable__item', 'echLegendTable__item--highlightable', {
    'echLegendTable__item--hidden': isSeriesHidden,
    'echLegendTable__item--vertical': positionConfig.direction === LayoutDirection.Vertical,
  });

  const legendValueItems = prepareLegendValues(item, legendValues, totalItems, extraValues);

  const onLabelToggle = useCallback(
    (legendItemIds: SeriesIdentifier[]) => (negate: boolean) => {
      if (totalItems <= 1 || (!isToggleable && !onClick)) {
        return;
      }

      if (onClick) {
        onClick(legendItemIds);
      }

      if (isToggleable) {
        toggleDeselectSeriesAction({ legendItemIds, metaKey: negate });
      }
    },
    [onClick, toggleDeselectSeriesAction, isToggleable, totalItems],
  );

  const { renderItemColor, renderColorPickerPopup } = useLegendColorPicker(props);

  if (isItemHidden) return null;

  const ActionComponent = Action ? <Action series={seriesIdentifiers} color={color} label={label} /> : null;

  return (
    <>
      <LegendTableRow
        className={itemClassNames}
        onMouseEnter={() => onLegendItemMouseOver(seriesIdentifiers, path)}
        onMouseLeave={onLegendItemMouseOut}
        dir={isMostlyRTL ? 'rtl' : 'ltr'}
        data-ech-series-name={label}
      >
        <LegendTableCell className="echLegend__colorWrapper echLegendTable__colorCell">
          {renderItemColor()}
        </LegendTableCell>
        <LegendTableCell>
          <ItemLabel
            label={label}
            options={labelOptions}
            isToggleable={totalItems > 1 && item.isToggleable}
            onToggle={onLabelToggle(seriesIdentifiers)}
            isSeriesHidden={isSeriesHidden}
            totalSeriesCount={totalItems}
            hiddenSeriesCount={hiddenItems}
          />
        </LegendTableCell>

        {legendValueItems.map((l, i) => {
          return <LegendTableCell key={l?.type || i}>{l && <LegendValueComponent {...l} />}</LegendTableCell>;
        })}
        {ActionComponent && (
          <LegendTableCell>
            <div className={`echLegendItem__action ${showActionAlways ? '' : 'echLegendItem__action--hide'}`}>
              {ActionComponent}
            </div>
          </LegendTableCell>
        )}
      </LegendTableRow>
      {renderColorPickerPopup()}
    </>
  );
};

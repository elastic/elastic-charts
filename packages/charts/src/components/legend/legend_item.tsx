/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import React, { CSSProperties, useCallback } from 'react';

import { Label as ItemLabel } from './label';
import { useLegendColorPicker } from './legend_color_picker';
import { SharedLegendItemProps } from './types';
import { getExtra } from './utils';
import { LegendItem, LegendItemExtraValues, LegendValue } from '../../common/legend';
import { SeriesIdentifier } from '../../common/series_id';
import { LayoutDirection, isDefined } from '../../utils/common';

/** @internal */
export const LEGEND_HIERARCHY_MARGIN = 10;

/** @internal */
export interface LegendItemProps extends SharedLegendItemProps {
  item: LegendItem;
}

/** @internal */
export const prepareLegendValues = (
  item: LegendItem,
  legendValues: LegendValue[],
  totalItems: number,
  extraValues: Map<string, LegendItemExtraValues>,
) => {
  return legendValues.map((legendValue) => {
    if (legendValue === LegendValue.Value || legendValue === LegendValue.CurrentAndLastValue) {
      return getExtra(extraValues, item, totalItems);
    }
    return item.values.find(({ type }) => type === legendValue);
  });
};

/** @internal */
export const LegendListItem: React.FC<LegendItemProps> = (props) => {
  const {
    extraValues,
    item,
    legendValues,
    totalItems,
    action: Action,
    positionConfig,
    labelOptions,
    isMostlyRTL,
    flatLegend,
    onClick,
    toggleDeselectSeriesAction,
    hiddenItems,
    onLegendItemMouseOver,
    onLegendItemMouseOut,
  } = props;
  const { color, isSeriesHidden, isItemHidden, seriesIdentifiers, label, depth, path, isToggleable } = item;

  const itemClassNames = classNames('echLegendItem', {
    'echLegendItem--hidden': isSeriesHidden,
    'echLegendItem--vertical': positionConfig.direction === LayoutDirection.Vertical,
  });

  const legendValueItems = prepareLegendValues(item, legendValues, totalItems, extraValues).filter(isDefined);

  const style: CSSProperties = flatLegend
    ? {}
    : {
        [isMostlyRTL ? 'marginRight' : 'marginLeft']: LEGEND_HIERARCHY_MARGIN * (depth ?? 0),
      };

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

  return (
    <>
      <li
        className={itemClassNames}
        onMouseEnter={() => onLegendItemMouseOver(seriesIdentifiers, path)}
        onMouseLeave={onLegendItemMouseOut}
        style={style}
        dir={isMostlyRTL ? 'rtl' : 'ltr'}
        data-ech-series-name={label}
      >
        <div className="background" />
        <div className="echLegend__colorWrapper">{renderItemColor()}</div>
        <ItemLabel
          label={label}
          options={labelOptions}
          isToggleable={totalItems > 1 && item.isToggleable}
          onToggle={onLabelToggle(seriesIdentifiers)}
          isSeriesHidden={isSeriesHidden}
          totalSeriesCount={totalItems}
          hiddenSeriesCount={hiddenItems}
        />
        {!isSeriesHidden
          ? legendValueItems.map((legendValueItem) =>
              legendValueItem.label !== '' ? (
                <div key={legendValueItem.label} className="echLegendItem__legendValue">
                  {legendValueItem.label}
                </div>
              ) : null,
            )
          : null}
        {Action && (
          <div className="echLegendItem__action">
            <Action series={seriesIdentifiers} color={color} label={label} />
          </div>
        )}
      </li>
      {renderColorPickerPopup()}
    </>
  );
};

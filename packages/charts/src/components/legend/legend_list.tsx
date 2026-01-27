/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import type { CSSProperties } from 'react';
import React, { useCallback } from 'react';

import { LEGEND_HIERARCHY_MARGIN } from './constants';
import { Label as ItemLabel } from './label';
import { useLegendColorPicker } from './legend_color_picker';
import { prepareLegendValues } from './legend_item_utils';
import type { LegendItemProps } from './types';
import type { SeriesIdentifier } from '../../common/series_id';
import { LayoutDirection, isDefined } from '../../utils/common';

interface Props extends LegendItemProps {
  truncation?: 'px';
}

/** @internal */
export const LegendList: React.FC<Props> = (props) => {
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
    truncation,
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
          truncationMode={truncation}
        />
        {!isSeriesHidden
          ? legendValueItems.map((legendValueItem, index) =>
              legendValueItem.label !== '' ? (
                <div
                  key={truncation ? `${legendValueItem.type}-${index}` : legendValueItem.label}
                  className="echLegendItem__legendValue"
                  style={{
                    minWidth:
                      truncation && legendValueItem.maxLabel
                        ? `${legendValueItem.maxLabel.length * 7 + 4}px`
                        : undefined,
                  }}
                >
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

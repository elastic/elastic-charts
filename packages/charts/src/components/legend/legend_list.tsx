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
import { legendValueTitlesMap, LegendValue } from '../../common/legend';
import type { SeriesIdentifier } from '../../common/series_id';
import { LayoutDirection, isDefined } from '../../utils/common';

interface Props extends LegendItemProps {
  isListLayout?: boolean;
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
    isListLayout,
  } = props;
  const { color, isSeriesHidden, isItemHidden, seriesIdentifiers, label, depth, path, isToggleable } = item;

  const itemClassNames = classNames('echLegendItem', {
    'echLegendItem--hidden': isSeriesHidden,
    'echLegendItem--vertical': positionConfig.direction === LayoutDirection.Vertical,
  });

  const preparedLegendValues = prepareLegendValues(item, legendValues, totalItems, extraValues);
  const legendValueItems = preparedLegendValues.filter(isDefined);

  const style: CSSProperties = {
    ...(flatLegend
      ? {}
      : {
          [isMostlyRTL ? 'marginRight' : 'marginLeft']: LEGEND_HIERARCHY_MARGIN * (depth ?? 0),
        }),
    ...(isListLayout ? { whiteSpace: 'nowrap' } : {}),
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
          truncationMode={isListLayout ? 'px' : 'line'}
        />
        {!isSeriesHidden
          ? (isListLayout
              ? // In list layout, preserve the `legendValues` order and allow placeholders for CurrentAndLastValue
                legendValues.map((type, index) => ({ type, legendValueItem: preparedLegendValues[index], index }))
              : legendValueItems.map((legendValueItem, index) => ({
                  type: legendValueItem.type,
                  legendValueItem,
                  index,
                }))
            ).map(({ type, legendValueItem, index }) => {
              const showTitle = isListLayout;
              const title = showTitle ? legendValueTitlesMap[type] : '';
              const titlePrefixLength = showTitle ? title.length + 2 : 0; // +2 for ": "

              const isCurrentAndLastValue = type === LegendValue.CurrentAndLastValue;
              const hasValue = Boolean(legendValueItem?.label);
              const showPlaceholder = Boolean(isListLayout && isCurrentAndLastValue && !hasValue);
              const displayedLabel = showPlaceholder ? '—' : legendValueItem?.label ?? '';

              if (displayedLabel === '') return null;

              const maxLabel =
                legendValueItem?.maxLabel ??
                (isCurrentAndLastValue
                  ? item.values.find(({ type: t }) => t === LegendValue.CurrentAndLastValue)?.maxLabel
                  : undefined);

              return (
                <div
                  key={isListLayout ? `${type}-${index}` : displayedLabel}
                  className="echLegendItem__legendValue"
                  style={{
                    minWidth:
                      isListLayout && maxLabel && isCurrentAndLastValue
                        ? `${(maxLabel.length + titlePrefixLength) * 7 + 4}px`
                        : undefined,
                  }}
                >
                  {showTitle ? (
                    <>
                      <strong>{title.toUpperCase()}:</strong> {displayedLabel}
                    </>
                  ) : (
                    displayedLabel
                  )}
                </div>
              );
            })
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

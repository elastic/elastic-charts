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
import type { LegendItemProps } from './types';
import { useActionFocusManagement } from './use_action_focus_management';
import { prepareLegendValues } from './utils';
import { legendValueTitlesMap, LegendValue } from '../../common/legend';
import type { SeriesIdentifier } from '../../common/series_id';
import { LayoutDirection, isDefined } from '../../utils/common';

interface Props extends LegendItemProps {
  isListLayout?: boolean;
  maxFormattedValueWidth?: number;
}

/** @internal */
export const LegendList: React.FC<Props> = (props) => {
  const {
    extraValues,
    item,
    legendValues,
    totalItems,
    action: Action,
    legendActionOnHover,
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
    maxFormattedValueWidth,
  } = props;
  const { color, isSeriesHidden, isItemHidden, seriesIdentifiers, label, depth, path, isToggleable } = item;
  const { isActive, actionRef, handlePointerDown, handleKeyDown } = useActionFocusManagement();

  const itemClassNames = classNames('echLegendItem', {
    'echLegendItem--hidden': isSeriesHidden,
    'echLegendItem--vertical': positionConfig.direction === LayoutDirection.Vertical,
    'echLegendItem--isActive': isActive,
    'echLegendItem--actionOnHover': legendActionOnHover,
  });

  const preparedLegendValues = prepareLegendValues(item, legendValues, totalItems, extraValues);
  const legendValueItems = preparedLegendValues.filter(isDefined);

  const style: CSSProperties = {
    ...(flatLegend
      ? {}
      : {
          [isMostlyRTL ? 'marginRight' : 'marginLeft']: LEGEND_HIERARCHY_MARGIN * (depth ?? 0),
        }),
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

  // Pre-compute value elements for both layout modes
  const valueElements: React.ReactNode[] = [];
  if (!isSeriesHidden) {
    const valueData = isListLayout
      ? // In list layout, preserve the `legendValues` order and allow placeholders for CurrentAndLastValue
        legendValues.map((type, index) => ({ type, legendValueItem: preparedLegendValues[index], index }))
      : legendValueItems.map((legendValueItem, index) => ({
          type: legendValueItem.type,
          legendValueItem,
          index,
        }));

    for (const { type, legendValueItem, index } of valueData) {
      const showTitle = isListLayout;
      const title = showTitle ? legendValueTitlesMap[type] : '';

      const isCurrentAndLastValue = type === LegendValue.CurrentAndLastValue;
      const hasValue = Boolean(legendValueItem?.label);
      const showPlaceholder = Boolean(isListLayout && isCurrentAndLastValue && !hasValue);
      const displayedLabel = showPlaceholder ? '—' : legendValueItem?.label ?? '';

      if (displayedLabel === '') continue;

      valueElements.push(
        <div
          key={isListLayout ? `${type}-${index}` : displayedLabel}
          className="echLegendItem__legendValue"
          style={{
            textAlign: isListLayout ? 'left' : undefined,
            minWidth:
              isListLayout && maxFormattedValueWidth && isCurrentAndLastValue
                ? `${maxFormattedValueWidth}px`
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
        </div>,
      );
    }
  }

  const actionElement = Action ? (
    <div
      className="echLegendItem__action"
      ref={actionRef}
      onPointerDownCapture={handlePointerDown}
      onKeyDown={handleKeyDown}
    >
      <Action series={seriesIdentifiers} color={color} label={label} />
    </div>
  ) : null;

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
        {isListLayout ? (
          <>
            <span className="echLegendItem__colorLabel">
              <div className="echLegend__colorWrapper">{renderItemColor()}</div>
              <ItemLabel
                label={label}
                options={labelOptions}
                isToggleable={totalItems > 1 && item.isToggleable}
                onToggle={onLabelToggle(seriesIdentifiers)}
                isSeriesHidden={isSeriesHidden}
                totalSeriesCount={totalItems}
                hiddenSeriesCount={hiddenItems}
                truncationMode="px"
              />
              {actionElement && valueElements.length === 0 && actionElement}
            </span>
            {actionElement && valueElements.length > 0 ? (
              <>
                {valueElements.slice(0, -1)}
                <span className="echLegendItem__actionGroup">
                  {valueElements.at(-1)}
                  {actionElement}
                </span>
              </>
            ) : !actionElement ? (
              valueElements
            ) : null}
          </>
        ) : (
          <>
            <div className="echLegend__colorWrapper">{renderItemColor()}</div>
            <ItemLabel
              label={label}
              options={labelOptions}
              isToggleable={totalItems > 1 && item.isToggleable}
              onToggle={onLabelToggle(seriesIdentifiers)}
              isSeriesHidden={isSeriesHidden}
              totalSeriesCount={totalItems}
              hiddenSeriesCount={hiddenItems}
              truncationMode="line"
            />
            {valueElements}
            {actionElement}
          </>
        )}
      </li>
      {renderColorPickerPopup()}
    </>
  );
};

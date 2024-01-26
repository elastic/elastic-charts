/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import React, { Component, createRef, MouseEventHandler, CSSProperties } from 'react';

import { Color as ItemColor } from './color';
import { renderExtra } from './extra';
import { Label as ItemLabel } from './label';
import { getExtra } from './utils';
import { Color } from '../../common/colors';
import { LegendItem, LegendItemExtraValues } from '../../common/legend';
import { SeriesIdentifier } from '../../common/series_id';
import {
  LegendItemListener,
  BasicListener,
  LegendColorPicker,
  LegendAction,
  LegendPositionConfig,
} from '../../specs/settings';
import {
  clearTemporaryColors as clearTemporaryColorsAction,
  setTemporaryColor as setTemporaryColorAction,
  setPersistedColor as setPersistedColorAction,
} from '../../state/actions/colors';
import {
  onLegendItemOutAction,
  onLegendItemOverAction,
  onToggleDeselectSeriesAction,
} from '../../state/actions/legend';
import { LayoutDirection } from '../../utils/common';
import { deepEqual } from '../../utils/fast_deep_equal';
import { LegendLabelOptions } from '../../utils/themes/theme';

/** @internal */
export const LEGEND_HIERARCHY_MARGIN = 10;

/** @internal */
export interface LegendItemProps {
  item: LegendItem;
  flatLegend: boolean;
  totalItems: number;
  positionConfig: LegendPositionConfig;
  extraValues: Map<string, LegendItemExtraValues>;
  showExtra: boolean;
  isMostlyRTL: boolean;
  labelOptions: LegendLabelOptions;
  colorPicker?: LegendColorPicker;
  action?: LegendAction;
  onClick?: LegendItemListener;
  onMouseOut?: BasicListener;
  onMouseOver?: LegendItemListener;
  mouseOutAction: typeof onLegendItemOutAction;
  mouseOverAction: typeof onLegendItemOverAction;
  clearTemporaryColorsAction: typeof clearTemporaryColorsAction;
  setTemporaryColorAction: typeof setTemporaryColorAction;
  setPersistedColorAction: typeof setPersistedColorAction;
  toggleDeselectSeriesAction: typeof onToggleDeselectSeriesAction;
}

interface LegendItemState {
  isOpen: boolean;
  actionActive: boolean;
}

/** @internal */
export class LegendListItem extends Component<LegendItemProps, LegendItemState> {
  static displayName = 'LegendItem';

  shouldClearPersistedColor = false;

  colorRef = createRef<HTMLButtonElement>();

  state: LegendItemState = {
    isOpen: false,
    actionActive: false,
  };

  shouldComponentUpdate(nextProps: LegendItemProps, nextState: LegendItemState) {
    return !deepEqual(this.props, nextProps) || !deepEqual(this.state, nextState);
  }

  handleColorClick = (changeable: boolean): MouseEventHandler | undefined =>
    changeable
      ? (event) => {
          event.stopPropagation();
          this.toggleIsOpen();
        }
      : undefined;

  toggleIsOpen = () => {
    this.setState(({ isOpen }) => ({ isOpen: !isOpen }));
  };

  onLegendItemMouseOver = () => {
    const { onMouseOver, mouseOverAction, item } = this.props;
    // call the settings listener directly if available
    if (onMouseOver) {
      onMouseOver(item.seriesIdentifiers);
    }
    mouseOverAction(item.path);
  };

  onLegendItemMouseOut = () => {
    const { onMouseOut, mouseOutAction } = this.props;
    // call the settings listener directly if available
    if (onMouseOut) {
      onMouseOut();
    }
    mouseOutAction();
  };

  /**
   * Returns click function only if toggleable or click listern is provided
   */
  onLabelToggle = (legendItemId: SeriesIdentifier[]): ((negate: boolean) => void) | undefined => {
    const { item, onClick, toggleDeselectSeriesAction, totalItems } = this.props;
    if (totalItems <= 1 || (!item.isToggleable && !onClick)) {
      return;
    }

    return (negate) => {
      if (onClick) {
        onClick(legendItemId);
      }

      if (item.isToggleable) {
        toggleDeselectSeriesAction(legendItemId, negate);
      }
    };
  };

  renderColorPicker() {
    const {
      colorPicker: ColorPicker,
      item,
      clearTemporaryColorsAction,
      setTemporaryColorAction,
      setPersistedColorAction,
    } = this.props;
    const { seriesIdentifiers, color } = item;
    const seriesKeys = seriesIdentifiers.map(({ key }) => key);
    const handleClose = () => {
      setPersistedColorAction(seriesKeys, this.shouldClearPersistedColor ? null : color);
      clearTemporaryColorsAction();
      requestAnimationFrame(() => this.colorRef?.current?.focus());
      this.toggleIsOpen();
    };
    const handleChange = (c: Color | null) => {
      this.shouldClearPersistedColor = c === null;
      setTemporaryColorAction(seriesKeys, c);
    };
    if (ColorPicker && this.state.isOpen && this.colorRef.current) {
      return (
        <ColorPicker
          anchor={this.colorRef.current}
          color={color}
          onClose={handleClose}
          onChange={handleChange}
          seriesIdentifiers={seriesIdentifiers}
        />
      );
    }
  }

  render() {
    const {
      extraValues,
      item,
      showExtra,
      colorPicker,
      totalItems,
      action: Action,
      positionConfig,
      labelOptions,
      isMostlyRTL,
      flatLegend,
    } = this.props;
    const { color, isSeriesHidden, isItemHidden, seriesIdentifiers, label, pointStyle } = item;

    if (isItemHidden) return null;

    const itemClassNames = classNames('echLegendItem', {
      'echLegendItem--hidden': isSeriesHidden,
      'echLegendItem--vertical': positionConfig.direction === LayoutDirection.Vertical,
    });
    const hasColorPicker = Boolean(colorPicker);
    const extra = showExtra ? getExtra(extraValues, item, totalItems) : null;
    const style: CSSProperties = flatLegend
      ? {}
      : {
          [isMostlyRTL ? 'marginRight' : 'marginLeft']: LEGEND_HIERARCHY_MARGIN * (item.depth ?? 0),
        };
    return (
      <>
        <li
          className={itemClassNames}
          onMouseEnter={this.onLegendItemMouseOver}
          onMouseLeave={this.onLegendItemMouseOut}
          style={style}
          dir={isMostlyRTL ? 'rtl' : 'ltr'}
          data-ech-series-name={label}
        >
          <div className="background" />
          <div className="colorWrapper">
            <ItemColor
              ref={this.colorRef}
              color={color}
              seriesName={label}
              isSeriesHidden={isSeriesHidden}
              hasColorPicker={hasColorPicker}
              onClick={this.handleColorClick(hasColorPicker)}
              pointStyle={pointStyle}
            />
          </div>
          <ItemLabel
            label={label}
            options={labelOptions}
            isToggleable={totalItems > 1 && item.isToggleable}
            onToggle={this.onLabelToggle(seriesIdentifiers)}
            isSeriesHidden={isSeriesHidden}
          />
          {extra && !isSeriesHidden && renderExtra(extra.formatted)}
          {Action && (
            <div className="echLegendItem__action">
              <Action series={seriesIdentifiers} color={color} label={label} />
            </div>
          )}
        </li>
        {this.renderColorPicker()}
      </>
    );
  }
}

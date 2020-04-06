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

import classNames from 'classnames';
import React, { Component, createRef } from 'react';
import { deepEqual } from '../../utils/fast_deep_equal';
import { LegendItemListener, BasicListener, LegendColorPicker } from '../../specs/settings';
import { LegendItem, LegendItemExtraValues } from '../../commons/legend';
import { onLegendItemOutAction, onLegendItemOverAction } from '../../state/actions/legend';
import { Position, Color } from '../../utils/commons';
import { SeriesIdentifier } from '../../commons/series_id';
import {
  clearTemporaryColors as clearTemporaryColorsAction,
  setTemporaryColor as setTemporaryColorAction,
  setPersistedColor as setPersistedColorAction,
} from '../../state/actions/colors';
import { getExtra } from './utils';
import { renderColor } from './color';
import { renderLabel } from './label';
import { renderExtra } from './extra';

/** @internal */
export interface LegendItemProps {
  item: LegendItem;
  totalItems: number;
  position: Position;
  extraValues: Map<string, LegendItemExtraValues>;
  showExtra: boolean;
  colorPicker?: LegendColorPicker;
  onLegendItemClickListener?: LegendItemListener;
  onLegendItemOutListener?: BasicListener;
  onLegendItemOverListener?: LegendItemListener;
  legendItemOutAction: typeof onLegendItemOutAction;
  legendItemOverAction: typeof onLegendItemOverAction;
  clearTemporaryColors: typeof clearTemporaryColorsAction;
  setTemporaryColor: typeof setTemporaryColorAction;
  setPersistedColor: typeof setPersistedColorAction;
  toggleDeselectSeriesAction: (legendItemId: SeriesIdentifier) => void;
}

/**
 * @internal
 * @param item
 * @param props
 */
export function renderLegendItem(
  item: LegendItem,
  props: Omit<LegendItemProps, 'item'>,
  totalItems: number,
  index: number,
) {
  const {
    seriesIdentifier: { key },
    childId,
  } = item;

  return (
    <LegendListItem
      key={`${key}-${childId}-${index}`}
      item={item}
      totalItems={totalItems}
      position={props.position}
      colorPicker={props.colorPicker}
      extraValues={props.extraValues}
      showExtra={props.showExtra}
      toggleDeselectSeriesAction={props.toggleDeselectSeriesAction}
      legendItemOutAction={props.legendItemOutAction}
      legendItemOverAction={props.legendItemOverAction}
      clearTemporaryColors={props.clearTemporaryColors}
      setTemporaryColor={props.setTemporaryColor}
      setPersistedColor={props.setPersistedColor}
      onLegendItemOverListener={props.onLegendItemOverListener}
      onLegendItemOutListener={props.onLegendItemOutListener}
      onLegendItemClickListener={props.onLegendItemClickListener}
    />
  );
}

interface LegendItemState {
  isOpen: boolean;
}

/** @internal */
export class LegendListItem extends Component<LegendItemProps, LegendItemState> {
  static displayName = 'LegendItem';
  ref = createRef<HTMLLIElement>();

  state: LegendItemState = {
    isOpen: false,
  };

  shouldComponentUpdate(nextProps: LegendItemProps, nextState: LegendItemState) {
    return !deepEqual(this.props, nextProps) || !deepEqual(this.state, nextState);
  }

  handleColorClick = (changable: boolean) =>
    changable
      ? (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
          event.stopPropagation();
          this.toggleIsOpen();
        }
      : undefined;

  renderColorPicker() {
    const { colorPicker: ColorPicker, item, clearTemporaryColors, setTemporaryColor, setPersistedColor } = this.props;
    const { seriesIdentifier, color } = item;

    const handleClose = () => {
      setPersistedColor(seriesIdentifier.key, color);
      clearTemporaryColors();
      this.toggleIsOpen();
    };
    if (ColorPicker && this.state.isOpen && this.ref.current) {
      return (
        <ColorPicker
          anchor={this.ref.current}
          color={color}
          onClose={handleClose}
          onChange={(color: Color) => setTemporaryColor(seriesIdentifier.key, color)}
          seriesIdentifier={seriesIdentifier}
        />
      );
    }
  }

  render() {
    const { extraValues, item, showExtra, onLegendItemClickListener, colorPicker, position, totalItems } = this.props;
    const { color, isSeriesVisible, isLegendItemVisible, seriesIdentifier, label } = item;
    const onLabelClick = this.onVisibilityClick(seriesIdentifier);
    const hasLabelClickListener = Boolean(onLegendItemClickListener);

    const itemClassNames = classNames('echLegendItem', `echLegendItem--${position}`, {
      'echLegendItem--hidden': !isSeriesVisible,
      'echLegendItem__extra--hidden': !isLegendItemVisible,
    });

    const hasColorPicker = Boolean(colorPicker);
    const colorClick = this.handleColorClick(hasColorPicker);
    const extra = getExtra(extraValues, item, totalItems);
    const style = item.depth
      ? {
          marginLeft: 10 * (item.depth ?? 0),
        }
      : undefined;
    return (
      <>
        <li
          ref={this.ref}
          className={itemClassNames}
          onMouseEnter={this.onLegendItemMouseOver}
          onMouseLeave={this.onLegendItemMouseOut}
          style={style}
        >
          {renderColor(color, isSeriesVisible, hasColorPicker, colorClick)}
          {renderLabel(label, onLabelClick, hasLabelClickListener)}
          {showExtra && extra != null && renderExtra(extra, isSeriesVisible)}
        </li>
        {this.renderColorPicker()}
      </>
    );
  }

  toggleIsOpen = () => {
    this.setState(({ isOpen }) => ({ isOpen: !isOpen }));
  };

  onLegendItemMouseOver = () => {
    const { onLegendItemOverListener, legendItemOverAction, item } = this.props;
    // call the settings listener directly if available
    if (onLegendItemOverListener) {
      onLegendItemOverListener(item.seriesIdentifier);
    }
    legendItemOverAction(item.seriesIdentifier.key);
  };

  onLegendItemMouseOut = () => {
    const { onLegendItemOutListener, legendItemOutAction } = this.props;
    // call the settings listener directly if available
    if (onLegendItemOutListener) {
      onLegendItemOutListener();
    }
    legendItemOutAction();
  };

  // TODO handle shift key
  onVisibilityClick = (legendItemId: SeriesIdentifier) => () => {
    const { onLegendItemClickListener, toggleDeselectSeriesAction } = this.props;
    if (onLegendItemClickListener) {
      onLegendItemClickListener(legendItemId);
    }
    toggleDeselectSeriesAction(legendItemId);
  };
}

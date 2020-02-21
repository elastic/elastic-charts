import classNames from 'classnames';
import React, { Component, ReactNode } from 'react';
import { deepEqual } from '../../utils/fast_deep_equal';
import { Icon } from '../icons/icon';
import { LegendItemListener, BasicListener } from '../../specs/settings';
import { LegendItem } from '../../chart_types/xy_chart/legend/legend';
import { onLegendItemOutAction, onLegendItemOverAction } from '../../state/actions/legend';
import { Position } from '../../utils/commons';
import { XYChartSeriesIdentifier } from '../../chart_types/xy_chart/utils/series';

export type RenderColorPicker = (
  onChange: (color: string) => void,
  onClose: () => void,
  isOpen: boolean,
  button: NonNullable<ReactNode>,
) => ReactNode;

interface LegendItemProps {
  legendItem: LegendItem;
  extra: string;
  label?: string;
  legendPosition: Position;
  renderColorPicker?: RenderColorPicker;
  showExtra: boolean;
  onLegendItemClickListener?: LegendItemListener;
  onLegendItemOutListener?: BasicListener;
  onLegendItemOverListener?: LegendItemListener;
  legendItemOutAction: typeof onLegendItemOutAction;
  legendItemOverAction: typeof onLegendItemOverAction;
  toggleDeselectSeriesAction: (legendItemId: XYChartSeriesIdentifier) => void;
}

/**
 * Create a div for the extra text
 * @param extra
 * @param isSeriesVisible
 */
function renderExtra(extra: string, isSeriesVisible: boolean | undefined) {
  const extraClassNames = classNames('echLegendItem__extra', {
    ['echLegendItem__extra--hidden']: !isSeriesVisible,
  });
  return (
    <div className={extraClassNames} title={extra}>
      {extra}
    </div>
  );
}

/**
 * Create a div for the label
 * @param label
 * @param onLabelClick
 * @param hasLabelClickListener
 */
function renderLabel(
  onLabelClick: (event: React.MouseEvent<Element, MouseEvent>) => void,
  hasLabelClickListener: boolean,
  label?: string,
) {
  if (!label) {
    return null;
  }
  const labelClassNames = classNames('echLegendItem__label', {
    ['echLegendItem__label--hasClickListener']: hasLabelClickListener,
  });
  return (
    <div className={labelClassNames} title={label} onClick={onLabelClick}>
      {label}
    </div>
  );
}

interface LegendItemState {
  isOpen: boolean;
  color?: string;
}

export class LegendListItem extends Component<LegendItemProps, LegendItemState> {
  static displayName = 'LegendItem';

  state: LegendItemState = {
    isOpen: false,
  };

  shouldComponentUpdate(nextProps: LegendItemProps, nextState: LegendItemState) {
    return !deepEqual(this.props, nextProps) || !deepEqual(this.state, nextState);
  }

  /**
   * Create a div for the color/eye icon
   * @param color
   * @param isSeriesVisible
   */
  renderColor = (color?: string, isSeriesVisible = true) => {
    if (!color) {
      return null;
    }

    if (isSeriesVisible) {
      const changable = Boolean(this.props.renderColorPicker);
      const colorClasses = classNames('echLegendItem__color', {
        'echLegendItem__color--changable': changable,
      });

      return (
        <div
          onClick={
            changable
              ? (e) => {
                  e.stopPropagation();
                  this.setToggleIsOpen();
                }
              : undefined
          }
          className={colorClasses}
          aria-label="series color"
          title="series color"
        >
          <Icon type="dot" color={color} />
        </div>
      );
    }

    // changing the default viewBox for the eyeClosed icon to keep the same dimensions
    return (
      <div className="echLegendItem__color" aria-label="series hidden" title="series hidden">
        <Icon type="eyeClosed" viewBox="-3 -3 22 22" />
      </div>
    );
  };

  renderItem = () => {
    const { extra, legendItem, legendPosition, label, showExtra, onLegendItemClickListener } = this.props;
    const { color, isSeriesVisible, seriesIdentifier, isLegendItemVisible } = legendItem;
    const onLabelClick = this.onVisibilityClick(seriesIdentifier);
    const hasLabelClickListener = Boolean(onLegendItemClickListener);

    const itemClassNames = classNames('echLegendItem', `echLegendItem--${legendPosition}`, {
      'echLegendItem--isHidden': !isSeriesVisible,
      'echLegendItem__extra--hidden': !isLegendItemVisible,
    });

    return (
      <div
        className={itemClassNames}
        onMouseEnter={this.onLegendItemMouseOver}
        onMouseLeave={this.onLegendItemMouseOut}
      >
        {this.renderColor(this.state.color ?? color, isSeriesVisible)}
        {renderLabel(onLabelClick, hasLabelClickListener, label)}
        {showExtra && renderExtra(extra, isSeriesVisible)}
      </div>
    );
  };

  render() {
    const { renderColorPicker } = this.props;
    if (renderColorPicker && this.state.isOpen) {
      return renderColorPicker(this.onColorChange, this.setToggleIsOpen, this.state.isOpen, this.renderItem());
    }

    return this.renderItem();
  }

  setToggleIsOpen = () => {
    this.setState({ isOpen: !this.state.isOpen });
  };

  onColorChange = (color: string) => {
    this.setState({
      color,
      isOpen: !this.state.isOpen,
    });
  };

  onLegendItemMouseOver = () => {
    const { onLegendItemOverListener, legendItemOverAction, legendItem } = this.props;
    // call the settings listener directly if available
    if (onLegendItemOverListener) {
      onLegendItemOverListener(legendItem.seriesIdentifier);
    }
    legendItemOverAction(legendItem.key);
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
  onVisibilityClick = (legendItemId: XYChartSeriesIdentifier) => () => {
    const { onLegendItemClickListener, toggleDeselectSeriesAction } = this.props;
    if (onLegendItemClickListener) {
      onLegendItemClickListener(legendItemId);
    }
    toggleDeselectSeriesAction(legendItemId);
  };
}

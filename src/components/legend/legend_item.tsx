import classNames from 'classnames';
import React, { Component, ReactNode } from 'react';
import { deepEqual } from '../../utils/fast_deep_equal';
import { Icon } from '../icons/icon';
import { LegendItemListener, BasicListener } from '../../specs/settings';
import { LegendItem } from '../../chart_types/xy_chart/legend/legend';
import { onLegendItemOutAction, onLegendItemOverAction } from '../../state/actions/legend';
import { Position } from '../../chart_types/xy_chart/utils/specs';
import { SeriesIdentifier } from '../../chart_types/xy_chart/utils/series';

export type RenderColorPicker = (
  onChange: (color: string) => void,
  onClose: () => void,
  isOpen: boolean,
  button: NonNullable<ReactNode>,
) => ReactNode;

interface LegendItemProps {
  selectedLegendItem?: LegendItem | null;
  legendItem: LegendItem;
  displayValue: string;
  label?: string;
  legendPosition: Position;
  showLegendDisplayValue: boolean;
  renderColorPicker?: RenderColorPicker;
  onLegendItemClickListener?: LegendItemListener;
  onLegendItemOutListener?: BasicListener;
  onLegendItemOverListener?: LegendItemListener;
  legendItemOutAction: typeof onLegendItemOutAction;
  legendItemOverAction: typeof onLegendItemOverAction;
  toggleDeselectSeriesAction: (legendItemId: SeriesIdentifier) => void;
}

/**
 * Create a div for the the displayed value
 * @param displayValue
 * @param isSeriesVisible
 */
function renderDisplayValue(displayValue: string, isSeriesVisible: boolean | undefined) {
  const displayValueClassNames = classNames('echLegendItem__displayValue', {
    ['echLegendItem__displayValue--hidden']: !isSeriesVisible,
  });
  return (
    <div className={displayValueClassNames} title={displayValue}>
      {displayValue}
    </div>
  );
}

/**
 * Create a div for the title
 * @param title
 * @param onTitleClick
 * @param hasTitleClickListener
 * @param isSelected
 * @param showLegendDisplayValue
 */
function renderTitle(
  title: string,
  onTitleClick: (event: React.MouseEvent<Element, MouseEvent>) => void,
  hasTitleClickListener: boolean,
  isSelected: boolean,
  showLegendDisplayValue: boolean,
) {
  // TODO add contextual menu panel on click
  const titleClassNames = classNames('echLegendItem__title', {
    ['echLegendItem__title--hasClickListener']: hasTitleClickListener,
    ['echLegendItem__title--selected']: isSelected,
    ['echLegendItem__title--hasDisplayValue']: showLegendDisplayValue,
  });
  return (
    <div className={titleClassNames} title={title} onClick={onTitleClick}>
      {title}
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
  renderColor = (color: string, isSeriesVisible = true) => {
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
    const { displayValue, legendItem, legendPosition, label } = this.props;
    const { color, isSeriesVisible, seriesIdentifier, isLegendItemVisible } = legendItem;
    const onTitleClick = this.onVisibilityClick(seriesIdentifier);

    const { showLegendDisplayValue, selectedLegendItem, onLegendItemClickListener } = this.props;
    const isSelected =
      selectedLegendItem == null ? false : selectedLegendItem.seriesIdentifier.key === seriesIdentifier.key;
    const hasTitleClickListener = Boolean(onLegendItemClickListener);
    const itemClasses = classNames('echLegendItem', `echLegendItem--${legendPosition}`, {
      'echLegendItem--hidden': !isSeriesVisible,
      'echLegendItem__displayValue--hidden': !isLegendItemVisible,
    });

    return (
      <div className={itemClasses} onMouseEnter={this.onLegendItemMouseOver} onMouseLeave={this.onLegendItemMouseOut}>
        {color && this.renderColor(this.state.color ?? color, isSeriesVisible)}
        {label && renderTitle(label, onTitleClick, hasTitleClickListener, isSelected, showLegendDisplayValue)}
        {showLegendDisplayValue && renderDisplayValue(displayValue, isSeriesVisible)}
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
  onVisibilityClick = (legendItemId: SeriesIdentifier) => () => {
    const { onLegendItemClickListener, toggleDeselectSeriesAction } = this.props;
    if (onLegendItemClickListener) {
      onLegendItemClickListener(legendItemId);
    }
    toggleDeselectSeriesAction(legendItemId);
  };
}

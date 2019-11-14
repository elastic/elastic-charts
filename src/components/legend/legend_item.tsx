import classNames from 'classnames';
import React from 'react';
import { Icon } from '../icons/icon';
import { LegendItemListener, BasicListener } from '../../specs/settings';
import { isEqualSeriesKey } from '../../chart_types/xy_chart/utils/series_utils';
import { DataSeriesColorsValues } from '../../chart_types/xy_chart/utils/series';
import { Position } from '../../chart_types/xy_chart/utils/specs';
import { LegendItem } from '../../chart_types/xy_chart/legend/legend';
import { onLegendItemClick, onLegendItemOut, onLegendItemOver } from '../../state/actions/legend';

interface LegendItemProps {
  legendPosition: Position;
  showLegendDisplayValue: boolean;
  selectedLegendItem?: LegendItem | null;
  onLegendItemClickListener?: LegendItemListener;
  onLegendItemOutListener?: BasicListener;
  onLegendItemOverListener?: LegendItemListener;
  legendItem: LegendItem;
  displayValue: string;
  label?: string;
  onLegendItemClick: typeof onLegendItemClick;
  onLegendItemOut: typeof onLegendItemOut;
  onLegendItemOver: typeof onLegendItemOver;
  toggleSingleSeries: (legendItemId: DataSeriesColorsValues) => void;
  toggleSeriesVisibility: (legendItemId: DataSeriesColorsValues) => void;
}

interface LegendItemState {
  isColorPickerOpen: boolean;
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
  title: string | undefined,
  onTitleClick: (event: React.MouseEvent<Element, MouseEvent>) => void,
  hasTitleClickListener: boolean,
  isSelected: boolean,
  showLegendDisplayValue: boolean,
) {
  // TODO add contextual menu panel on click
  if (!title) {
    return null;
  }
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

/**
 * Create a div for the color/eye icon
 * @param color
 * @param isSeriesVisible
 */
function renderColor(color?: string, isSeriesVisible = true) {
  if (!color) {
    return null;
  }
  // TODO add color picker
  const iconType = isSeriesVisible ? 'dot' : 'eyeClosed';
  const iconColor = isSeriesVisible ? color : undefined;
  const title = isSeriesVisible ? 'series color' : 'series hidden';
  const viewBox = isSeriesVisible ? undefined : '-3 -3 22 22';
  return (
    <div className="echLegendItem__color" aria-label={title} title={title}>
      <Icon type={iconType} color={iconColor} viewBox={viewBox} />
    </div>
  );
}

export class LegendListItem extends React.PureComponent<LegendItemProps, LegendItemState> {
  static displayName = 'LegendItem';

  constructor(props: LegendItemProps) {
    super(props);
    this.state = {
      isColorPickerOpen: false,
    };
  }

  closeColorPicker = () => {
    this.setState({
      isColorPickerOpen: false,
    });
  };

  toggleColorPicker = () => {
    this.setState({
      isColorPickerOpen: !this.state.isColorPickerOpen,
    });
  };

  render() {
    const { displayValue, legendItem, legendPosition, label } = this.props;
    const { color, isSeriesVisible, value, isLegendItemVisible } = legendItem;
    const onTitleClick = this.onVisibilityClick(legendItem.value);

    const { showLegendDisplayValue, selectedLegendItem, onLegendItemClickListener } = this.props;
    const isSelected =
      selectedLegendItem == null
        ? false
        : isEqualSeriesKey(value.colorValues, selectedLegendItem.value.colorValues) &&
          value.specId === selectedLegendItem.value.specId;
    const hasTitleClickListener = Boolean(onLegendItemClickListener);
    const itemClasses = classNames('echLegendItem', `echLegendItem--${legendPosition}`, {
      'echLegendItem-isHidden': !isSeriesVisible,
      'echLegendItem__displayValue--hidden': !isLegendItemVisible,
    });

    return (
      <div className={itemClasses} onMouseEnter={this.onLegendItemMouseOver} onMouseLeave={this.onLegendItemMouseOut}>
        {renderColor(color, isSeriesVisible)}
        {renderTitle(label, onTitleClick, hasTitleClickListener, isSelected, showLegendDisplayValue)}
        {showLegendDisplayValue && renderDisplayValue(displayValue, isSeriesVisible)}
      </div>
    );
  }

  renderVisibilityButton = (legendItem: LegendItem, isSeriesVisible = true) => {
    const iconType = isSeriesVisible ? 'eye' : 'eyeClosed';
    return (
      <div className="echLegendItem__visibility">
        <Icon type={iconType} aria-label="toggle visibility" onClick={this.onVisibilityClick(legendItem.value)} />
      </div>
    );
  };

  onLegendTitleClick = (legendItemId: DataSeriesColorsValues) => () => {
    this.props.onLegendItemClick(legendItemId);
  };
  onLegendItemMouseOver = () => {
    this.props.onLegendItemOver(this.props.legendItem.key);
  };

  onLegendItemMouseOut = () => {
    this.props.onLegendItemOut();
  };

  onVisibilityClick = (legendItemId: DataSeriesColorsValues) => (event: React.MouseEvent) => {
    if (event.shiftKey) {
      this.props.toggleSingleSeries(legendItemId);
    } else {
      this.props.toggleSeriesVisibility(legendItemId);
    }
  };

  // Keeping these as reference when we have a contextual panel
  // private onLegendItemPanelClose = () => {
  //   // tslint:disable-next-line:no-console
  //   console.log('close');
  // }

  // private onColorPickerChange = (legendItemKey: string) => (color: string) => {
  //   this.props.chartStore!.setSeriesColor(legendItemKey, color);
  // }

  // private renderPlusButton = () => {
  //   return (
  //     <EuiButtonIcon
  //       onClick={this.props.chartStore!.onLegendItemPlusClick}
  //       iconType="plusInCircle"
  //       aria-label="minus"
  //     />
  //   );
  // }

  // private renderMinusButton = () => {
  //   return (
  //     <EuiButtonIcon
  //       onClick={this.props.chartStore!.onLegendItemMinusClick}
  //       iconType="minusInCircle"
  //       aria-label="minus"
  //     />
  //   );
  // }
}

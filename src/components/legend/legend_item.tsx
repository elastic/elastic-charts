import classNames from 'classnames';
import React from 'react';
import { Icon } from '../icons/icon';
import { LegendItemListener } from '../../specs/settings';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { GlobalChartState } from '../../state/chart_state';
import { getSettingsSpecSelector } from '../../state/selectors/get_settings_specs';
import { onLegendItemClick, onToggleDeselectSeries } from '../../state/actions/legend';
import { isEqualSeriesKey } from '../../chart_types/xy_chart/utils/series_utils';
import { DataSeriesColorsValues } from '../../chart_types/xy_chart/utils/series';
import { Position } from '../../chart_types/xy_chart/utils/specs';
import { LegendItem } from '../../chart_types/xy_chart/legend/legend';

interface LegendItemOwnProps {
  legendItem: LegendItem;
  displayValue: string;
  label?: string;
  onMouseEnter: (event: React.MouseEvent) => void;
  onMouseLeave: () => void;
}

interface LegendItemState {
  isColorPickerOpen: boolean;
}
interface LegendItemDispatchProps {
  onLegendItemClick: (legendItemId: DataSeriesColorsValues) => void;
  toggleSingleSeries: (legendItemId: DataSeriesColorsValues) => void;
  toggleSeriesVisibility: (legendItemId: DataSeriesColorsValues) => void;
}
interface LegendItemStateProps {
  legendPosition: Position;
  showLegendDisplayValue: boolean;
  selectedLegendItem?: LegendItem | null;
  onLegendItemClickListener?: LegendItemListener;
}

type LegendItemProps = LegendItemOwnProps & LegendItemDispatchProps & LegendItemStateProps;

class LegendItemComponent extends React.Component<LegendItemProps, LegendItemState> {
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
    const { displayValue, legendItem, onMouseEnter, onMouseLeave, legendPosition, label } = this.props;
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
      <div className={itemClasses} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
        {this.renderColor(this.toggleColorPicker, color, isSeriesVisible)}
        {this.renderTitle(label, onTitleClick, hasTitleClickListener, isSelected, showLegendDisplayValue)}
        {this.renderDisplayValue(displayValue, showLegendDisplayValue, isSeriesVisible)}
      </div>
    );
  }
  renderColor(colorClickAction: () => void, color?: string, isSeriesVisible = true) {
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
        <Icon type={iconType} color={iconColor} onClick={colorClickAction} viewBox={viewBox} />
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

  renderTitle(
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

  renderDisplayValue(displayValue: string, showLegendDisplayValue: boolean, isSeriesVisible: boolean | undefined) {
    if (!showLegendDisplayValue) {
      return;
    }
    const displayValueClassNames = classNames('echLegendItem__displayValue', {
      ['echLegendItem__displayValue--hidden']: !isSeriesVisible,
    });
    return (
      <div className={displayValueClassNames} title={displayValue}>
        {displayValue}
      </div>
    );
  }

  onLegendTitleClick = (legendItemId: DataSeriesColorsValues) => () => {
    this.props.onLegendItemClick(legendItemId);
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

  private onVisibilityClick = (legendItemId: DataSeriesColorsValues) => (event: React.MouseEvent) => {
    if (event.shiftKey) {
      this.props.toggleSingleSeries(legendItemId);
    } else {
      this.props.toggleSeriesVisibility(legendItemId);
    }
  };
}

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      onLegendItemClick,
      toggleSingleSeries: onToggleDeselectSeries,
      toggleSeriesVisibility: onToggleDeselectSeries,
    },
    dispatch,
  );

const mapStateToProps = (state: GlobalChartState): LegendItemStateProps => {
  if (!state.initialized) {
    return {
      showLegendDisplayValue: false,
      selectedLegendItem: null,
      legendPosition: Position.Right,
    };
  }
  const settingsSpec = getSettingsSpecSelector(state);
  return {
    showLegendDisplayValue: settingsSpec.showLegendDisplayValue,
    // Disabling the select until we implement the right contextual menu
    // with extend possibility
    selectedLegendItem: null,
    onLegendItemClickListener: settingsSpec.onLegendItemClick,
    legendPosition: settingsSpec.legendPosition,
  };
};

export const LegendListItem = connect(
  mapStateToProps,
  mapDispatchToProps,
)(LegendItemComponent);

import {
  EuiButtonIcon,
  // TODO: remove ts-ignore below once typings file is included in eui for color picker
  // @ts-ignore
  EuiColorPicker,
  EuiContextMenuPanel,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiPopover,
  EuiText,
} from '@elastic/eui';
import classNames from 'classnames';
import { inject, observer } from 'mobx-react';
import React from 'react';

import { ChartStore } from '../state/chart_state';

interface LegendElementProps {
  chartStore?: ChartStore; // FIX until we find a better way on ts mobx
  index: number;
  color: string | undefined;
  label: string | undefined;
}

interface LegendElementState {
  isColorPickerOpen: boolean;
}

class LegendElementComponent extends React.PureComponent<LegendElementProps, LegendElementState> {
  static displayName = 'LegendElement';

  constructor(props: LegendElementProps) {
    super(props);
    this.state = {
      isColorPickerOpen: false,
    };
  }

  closeColorPicker = () => {
    this.setState({
      isColorPickerOpen: false,
    });
  }

  toggleColorPicker = () => {
    this.setState({
      isColorPickerOpen: !this.state.isColorPickerOpen,
    });
  }

  render() {
    const legendItemIndex = this.props.index;
    const { color, label } = this.props;

    const onTitleClick = this.onLegendTitleClick(legendItemIndex);

    const isSelected = legendItemIndex === this.props.chartStore!.selectedLegendItemIndex.get();
    const titleClassNames = classNames({
      ['elasticChartsLegendListItem__title--selected']: isSelected,
    }, 'elasticChartsLegendListItem__title');

    const colorDotProps = {
      color,
      onClick: this.toggleColorPicker,
    };

    const colorDot = <EuiIcon type="dot" {...colorDotProps} />;

    return (
      <EuiFlexGroup gutterSize="xs" alignItems="center" responsive={false}>
        <EuiFlexItem grow={false}>
          <EuiPopover
            id="legendItemColorPicker"
            button={colorDot}
            isOpen={this.state.isColorPickerOpen}
            closePopover={this.closeColorPicker}
            panelPaddingSize="s"
            anchorPosition="downCenter"
          >
            <EuiContextMenuPanel>
              <EuiColorPicker onChange={this.onColorPickerChange} color={color} />
            </EuiContextMenuPanel>
          </EuiPopover>
        </EuiFlexItem>
        <EuiFlexItem grow={false} className={titleClassNames} onClick={onTitleClick}>
          <EuiPopover
            id="contentPanel"
            button={(<EuiText size="xs" className="eui-textTruncate elasticChartsLegendListItem__title">
              {label}
            </EuiText>)
            }
            isOpen={isSelected}
            closePopover={this.onLegendItemPanelClose}
            panelPaddingSize="s"
            anchorPosition="downCenter"
          >
            <EuiContextMenuPanel>
              <EuiFlexGroup gutterSize="xs" alignItems="center" responsive={false}>
                <EuiFlexItem>
                  {this.renderPlusButton()}
                </EuiFlexItem>
                <EuiFlexItem>
                  {this.renderMinusButton()}
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiContextMenuPanel>
          </EuiPopover>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }

  private onLegendTitleClick = (legendItemIndex: number) => () => {
    this.props.chartStore!.onLegendItemClick(legendItemIndex);
  }

  // private onLegendItemMouseover = (legendItemIndex: number) => () => {
  //   this.props.chartStore!.onLegendItemOver(legendItemIndex);
  // }

  // private onLegendItemMouseout = () => {
  //   this.props.chartStore!.onLegendItemOut();
  // }

  private onLegendItemPanelClose = () => {
    // tslint:disable-next-line:no-console
    console.log('close');
  }

  private onColorPickerChange = () => {
    // tslint:disable-next-line:no-console
    console.log('color picker close');
  }

  private renderPlusButton = () => {
    return (
      <EuiButtonIcon
        onClick={this.props.chartStore!.onLegendItemPlusClick}
        iconType="plusInCircle"
        aria-label="Show this group only"
      />);
  }

  private renderMinusButton = () => {
    return (
      <EuiButtonIcon
        onClick={this.props.chartStore!.onLegendItemMinusClick}
        iconType="minusInCircle"
        aria-label="Show this group only"
      />);
  }
}

export const LegendElement = inject('chartStore')(observer(LegendElementComponent));

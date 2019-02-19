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
import { isVertical } from '../lib/axes/axis_utils';
import { LegendItem } from '../lib/series/legend';
import { ChartStore } from '../state/chart_state';

interface ReactiveChartProps {
  chartStore?: ChartStore; // FIX until we find a better way on ts mobx
}

class LegendComponent extends React.Component<ReactiveChartProps> {
  static displayName = 'Legend';

  onCollapseLegend = () => {
    this.props.chartStore!.toggleLegendCollapsed();
  }

  render() {
    const {
      initialized,
      legendItems,
      legendPosition,
      showLegend,
      legendCollapsed,
      debug,
      chartTheme,
    } = this.props.chartStore!;

    if (
      !showLegend.get() ||
      !initialized.get() ||
      legendItems.length === 0 ||
      legendPosition === undefined
    ) {
      return null;
    }

    const legendClasses = classNames(
      'elasticChartsLegend',
      `elasticChartsLegend--${legendPosition}`,
      {
        'elasticChartsLegend--collapsed': legendCollapsed.get(),
        'elasticChartsLegend--debug': debug,
      },
    );
    let paddingStyle;
    if (isVertical(legendPosition)) {
      paddingStyle = {
        paddingTop: chartTheme.chartMargins.top,
        paddingBottom: chartTheme.chartMargins.bottom,
      };
    } else {
      paddingStyle = {
        paddingLeft: chartTheme.chartMargins.left,
        paddingRight: chartTheme.chartMargins.right,
      };
    }
    return (
      <div className={legendClasses} style={paddingStyle}>
        <div className="elasticChartsLegendList">
          <EuiFlexGroup
            gutterSize="s"
            wrap
            className="elasticChartsLegendListContainer"
            responsive={false}
          >
            {legendItems.map((item, index) => {
              const legendItemProps = {
                key: index,
                className: 'elasticChartsLegendList__item',
                onMouseEnter: this.onLegendItemMouseover(index),
                onMouseLeave: this.onLegendItemMouseout,
              };

              const { color, label } = item;

              return (
                <EuiFlexItem {...legendItemProps}>
                  {this.renderLegendElement({ color, label }, index)}
                </EuiFlexItem>
              );
            })}
          </EuiFlexGroup>
        </div>
      </div>
    );
  }

  private onLegendTitleClick = (legendItemIndex: number) => () => {
    this.props.chartStore!.onLegendItemClick(legendItemIndex);
  }

  private onLegendItemMouseover = (legendItemIndex: number) => () => {
    this.props.chartStore!.onLegendItemOver(legendItemIndex);
  }

  private onLegendItemMouseout = () => {
    this.props.chartStore!.onLegendItemOut();
  }

  private onLegendItemPanelClose = () => {
    // tslint:disable-next-line:no-console
    console.log('close');
  }

  private onColorPickerClose = () => {
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

  private renderLegendElement = ({ color, label }: Partial<LegendItem>, legendItemIndex: number) => {
    const onTitleClick = this.onLegendTitleClick(legendItemIndex);

    const isSelected = legendItemIndex === this.props.chartStore!.selectedLegendItemIndex.get();
    const titleClassNames = classNames({
      ['elasticChartsLegendListItem__title--selected']: isSelected,
    }, 'elasticChartsLegendListItem__title');

    return (
      <EuiFlexGroup gutterSize="xs" alignItems="center" responsive={false} onClick={onTitleClick}>
        <EuiFlexItem grow={false}>
          <EuiIcon type="dot" color={color} />
        </EuiFlexItem>
        <EuiFlexItem grow={false} className={titleClassNames}>
          <EuiPopover
            id="contentPanel"
            button={(<EuiText size="xs" className="eui-textTruncate">
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
              <EuiFlexGroup gutterSize="xs" alignItems="center" responsive={false}>
                <EuiFlexItem>
                  <EuiColorPicker onChange={this.onColorPickerClose} />
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiContextMenuPanel>
          </EuiPopover>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }
}

export const Legend = inject('chartStore')(observer(LegendComponent));

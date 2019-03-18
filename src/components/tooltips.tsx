import classNames from 'classnames';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { isCrosshairTooltipType, TooltipType, TooltipValue } from '../lib/utils/interactions';
import { ChartStore } from '../state/chart_state';

interface TooltipProps {
  chartStore?: ChartStore; // FIX until we find a better way on ts mobx
}

class TooltipsComponent extends React.Component<TooltipProps> {
  static displayName = 'Tooltips';

  render() {
    const {
      initialized,
      tooltipData,
      cursorPosition,
      cursorBandPosition,
      showTooltip,
      parentDimensions,
      chartDimensions,
      tooltipType,
    } = this.props.chartStore!;
    let hPosition;
    if (
      !initialized.get() ||
      tooltipType.get() === TooltipType.None ||
      !tooltipData ||
      tooltipData.length === 0 ||
      cursorBandPosition.x === -1 ||
      cursorBandPosition.y === -1 ||
      cursorPosition.y === -1
    ) {
      return <div className="elasticChartsTooltip elasticChartsTooltip--hidden" />;
    }
    if (cursorBandPosition.x <= chartDimensions.width / 2) {
      hPosition = {
        position: 'left',
        value: chartDimensions.left + cursorBandPosition.x + cursorBandPosition.width + 20,
      };
    } else {
      hPosition = {
        position: 'right',
        value: parentDimensions.width - chartDimensions.left - cursorBandPosition.x + 20,
      };
    }
    let vPosition = {
      position: 'top',
      value: chartDimensions.top,
    };
    // if crosshair fix the tooltip on the top
    if (isCrosshairTooltipType(tooltipType.get())) {
      vPosition = {
        position: 'top',
        value: chartDimensions.top,
      };
    } else {
      // if it's a follow tooltip, let the tooltip follow the mouse position
      if (cursorPosition.y <= chartDimensions.height / 2) {
        vPosition = {
          position: 'top',
          value: cursorPosition.y,
        };
      } else {
        vPosition = {
          position: 'bottom',
          value: chartDimensions.height - cursorPosition.y,
        };
      }
    }

    return this.renderTooltip(showTooltip.get(), tooltipData, vPosition, hPosition);
  }

  private renderTooltip = (
    showTooltip: boolean,
    tooltipData: TooltipValue[],
    vPosition: { position: string; value: number },
    hPosition: { position: string; value: number },
  ) => {
    const className = classNames('elasticChartsTooltip', {
      'elasticChartsTooltip--hidden': !showTooltip,
    });
    return (
      <div
        className={className}
        style={{
          position: 'absolute',
          [vPosition.position]: vPosition.value,
          [hPosition.position]: hPosition.value,
        }}
      >
        <p className="elasticChartsTooltip__header">{tooltipData[0] && tooltipData[0].value}</p>
        <div className="elasticChartsTooltip__table">
          <table>
            <tbody>
              {tooltipData.slice(1).map(({ name, value, color, isHighlighted }, index) => {
                const classes = classNames({
                  elasticChartsTooltip__rowHighlighted: isHighlighted,
                });
                return (
                  <tr key={`row-${index}`} className={classes}>
                    <td
                      className="elasticChartsTooltip__label"
                      style={{
                        borderLeftColor: color,
                      }}
                    >
                      {name}
                    </td>
                    <td>{value}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export const Tooltips = inject('chartStore')(observer(TooltipsComponent));

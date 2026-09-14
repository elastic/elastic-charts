/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import React, { useCallback, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import { Badge } from './badge';
import type { Color } from '../../../../common/colors';
import { Placement, TooltipPortal } from '../../../../components/portal';
import { TooltipContainer, TooltipHeader } from '../../../../components/tooltip';
import type { GlobalChartState } from '../../../../state/chart_state';
import type { MetricStyle } from '../../../../utils/themes/theme';
import type { SecondaryMetricLabelTooltipProps, SecondaryMetricProps } from '../../specs';

type SecondaryMetricInternalProps = Omit<SecondaryMetricProps, 'badgeBorderColor'> & {
  badgeBorderColor: Color | undefined;
  textAlign?: MetricStyle['extraTextAlign'];
};

/** @internal */
export const getTooltipPlacement = (
  textAlign: MetricStyle['extraTextAlign'] = 'center',
): SecondaryMetricLabelTooltipProps['placement'] => {
  if (textAlign === 'left') return Placement.Right;
  if (textAlign === 'right') return Placement.Left;
  return Placement.Top;
};

/** @internal */
export const LabelTooltip = ({
  label,
  anchorRef,
  placement,
  visible,
}: {
  label: string;
  anchorRef: React.RefObject<HTMLSpanElement>;
  placement: Placement;
  visible: boolean;
}) => {
  const chartId = useSelector((state: GlobalChartState) => state.chartId);
  const zIndex = useSelector((state: GlobalChartState) => state.zIndex);

  if (!visible) {
    return null;
  }

  return (
    <TooltipPortal
      scope="SecondaryMetricLabel"
      anchor={anchorRef}
      chartId={chartId}
      zIndex={zIndex + 100}
      visible
      settings={{ placement }}
    >
      <div aria-hidden="true" className="echSecondaryMetric__tooltip">
        <TooltipContainer>
          <TooltipHeader>{label}</TooltipHeader>
        </TooltipContainer>
      </div>
    </TooltipPortal>
  );
};

/** @internal */
export const SecondaryMetric: React.FC<SecondaryMetricInternalProps> = ({
  value,
  label,
  badgeColor,
  badgeTextColor,
  labelPosition = 'before',
  style,
  ariaDescription,
  badgeBorderColor,
  icon,
  iconPosition,
  textAlign,
  labelTooltip: LabelTooltipComponent,
}) => {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleTooltipEnter = useCallback(() => setShowTooltip(true), []);
  const handleTooltipLeave = useCallback(() => setShowTooltip(false), []);

  const hasInlineLabel = Boolean(label) && labelPosition !== 'tooltip';
  const hasTooltipLabel = Boolean(label) && labelPosition === 'tooltip';
  const useDefaultTooltip = hasTooltipLabel && !LabelTooltipComponent;

  const labelNode = hasInlineLabel ? (
    <span className="echSecondaryMetric__label echSecondaryMetric__truncate">{label}</span>
  ) : undefined;

  const metricElement = (
    <span
      ref={anchorRef}
      className="echSecondaryMetric"
      {...(hasTooltipLabel
        ? {
            role: 'button',
            tabIndex: 0,
          }
        : {})}
      {...(useDefaultTooltip
        ? {
            onPointerEnter: handleTooltipEnter,
            onPointerLeave: handleTooltipLeave,
            onFocus: handleTooltipEnter,
            onBlur: handleTooltipLeave,
          }
        : {})}
      {...(style ? { style } : {})}
      {...(ariaDescription ? { 'aria-describedby': ariaDescription } : {})}
    >
      {labelPosition === 'before' && labelNode}
      {hasTooltipLabel && <span className="echScreenReaderOnly">{label}</span>}
      {badgeColor ? (
        <Badge
          className={classNames('echSecondaryMetric__value', {
            'echSecondaryMetric__value--full': !hasInlineLabel,
          })}
          value={value}
          backgroundColor={badgeColor}
          textColor={badgeTextColor}
          borderColor={badgeBorderColor}
          icon={icon}
          iconPosition={iconPosition}
        />
      ) : (
        <span
          className={classNames('echSecondaryMetric__value', 'echSecondaryMetric__truncate', {
            'echSecondaryMetric__value--full': !hasInlineLabel,
          })}
        >
          {value}
        </span>
      )}
      {labelPosition === 'after' && labelNode}
      {useDefaultTooltip && label && (
        <LabelTooltip
          label={label}
          anchorRef={anchorRef}
          placement={getTooltipPlacement(textAlign)}
          visible={showTooltip}
        />
      )}
    </span>
  );

  if (hasTooltipLabel && LabelTooltipComponent && label) {
    return (
      <LabelTooltipComponent label={label} value={value} placement={getTooltipPlacement(textAlign)}>
        {metricElement}
      </LabelTooltipComponent>
    );
  }

  return metricElement;
};

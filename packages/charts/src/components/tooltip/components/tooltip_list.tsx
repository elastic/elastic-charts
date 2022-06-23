/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import React, { CSSProperties } from 'react';

import { colorToRgba } from '../../../common/color_library_wrappers';
import { Colors } from '../../../common/colors';
import { TooltipValue } from '../../../specs';
import { isNil, renderComplexChildren } from '../../../utils/common';
import { PropsOrChildren } from '../types';
import { TooltipListItem } from './tooltip_list_item';

type TooltipListContentProps = PropsOrChildren<{
  items: TooltipValue[];
  backgroundColor: string;
  renderItem?: typeof TooltipListItem;
}>;

type TooltipListProps = TooltipListContentProps & {
  maxHeight?: CSSProperties['maxHeight'];
};

/** @public */
export const TooltipList = ({ maxHeight, ...props }: TooltipListProps) => {
  const className = classNames('echTooltip__list', { 'echTooltip__list--scrollable': !isNil(maxHeight) });
  if ('children' in props) {
    return (
      <div className={className} style={{ maxHeight }}>
        {renderComplexChildren(props.children)}
      </div>
    );
  }

  const { items, backgroundColor, renderItem: Item = TooltipListItem } = props;
  return (
    <div className={className} style={{ maxHeight }}>
      {items
        .filter(({ isVisible }) => isVisible)
        .map((item, i) => {
          const adjustedBGColor = colorToRgba(item.color)[3] === 0 ? Colors.Transparent.keyword : backgroundColor;
          const classes = classNames('echTooltip__item', {
            echTooltip__rowHighlighted: item.isHighlighted,
          });

          return (
            <Item
              item={item}
              index={i}
              backgroundColor={adjustedBGColor}
              className={classes}
              key={`${item.seriesIdentifier.key}__${item.valueAccessor}__${i}`}
            />
          );
        })}
    </div>
  );
};

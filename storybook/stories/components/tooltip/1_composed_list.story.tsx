/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { select } from '@storybook/addon-knobs';
import React from 'react';

import { CustomTooltip, TooltipHeader, TooltipTable, TooltipTableColumn } from '@elastic/charts';
import { isDefined } from '@elastic/charts/src/utils/common';

import { tableSimple, simple, long } from './data';
import { TooltipShowcase } from './tooltip_showcase';

export const Example = () => {
  const dataSet = select(
    'dataSet',
    {
      'Simple - table': 'tableSimple',
      'Simple - list': 'simple',
      'Long - list': 'long',
    },
    'simple',
  );
  const dataSets = {
    tableSimple,
    simple,
    long,
  };
  const columns: TooltipTableColumn[] = [
    {
      id: 'label',
      renderCell: ({ label }) => <span className="echTooltip__label">{label}</span>,
      textAlign: 'left',
    },
    {
      id: 'value',
      renderCell: ({ formattedValue }) => (
        <span className="echTooltip__value" dir="ltr">
          {formattedValue}
        </span>
      ),
      textAlign: 'right',
    },
    {
      id: 'markValue',
      hidden: (items) => items.every(({ markValue }) => !markValue),
      renderCell: ({ markValue, formattedMarkValue }) =>
        isDefined(markValue) ? <span className="echTooltip__markValue">&nbsp;({formattedMarkValue})</span> : null,
    },
  ];
  const MyTooltip: CustomTooltip = ({ header, values }) => {
    return (
      <>
        <TooltipHeader header={header} />
        <TooltipTable columns={columns} items={values} />
      </>
    );
  };

  return <TooltipShowcase info={dataSets[dataSet]} customTooltip={MyTooltip} />;
};

Example.parameters = {
  markdown: `Tooltips may be composed with internal components to build out completely custom tooltips while maintaining a consistent style.\
  This example shows how you can build the default list tooltip by defining the \`columns\` on the \`TooltipTable\` component inside a \`CustomTooltip\`.`,
};

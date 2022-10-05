/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, {
  CSSProperties,
  MutableRefObject,
  Dispatch,
  SetStateAction,
  useContext,
  Context,
  PropsWithChildren,
  useRef,
} from 'react';

interface TableColumnWidthContext {
  gridTemplateColumns: CSSProperties['gridTemplateColumns'];
  rowCount: MutableRefObject<number>;
  incrementRowCount: () => void;
  setGridTemplateColumns: Dispatch<SetStateAction<CSSProperties['gridTemplateColumns']>>;
}

/** @internal */
export const useTableColumnWidthContext = () =>
  useContext<TableColumnWidthContext>(TableColumnWidthContext as unknown as Context<TableColumnWidthContext>);

const TableColumnWidthContext = React.createContext<TableColumnWidthContext>({
  gridTemplateColumns: '',
  rowCount: { current: 0 },
  incrementRowCount: () => {},
  setGridTemplateColumns: () => {},
});

type TableColumnWidthProps =
  | { disabled: true }
  | ({ disabled: boolean } & Pick<TableColumnWidthContext, 'gridTemplateColumns' | 'setGridTemplateColumns'>);

/**
 * This provider is used to dynamically size the columns of the table when using ech children
 * and not columns. If no ech children are passed the table will revert to display table over grid.
 * @internal
 */
export const TableColumnWidthProvider = ({ children, disabled, ...rest }: PropsWithChildren<TableColumnWidthProps>) => {
  const rowCount = useRef(disabled ? -1 : 0);
  const incrementRowCount = disabled
    ? () => {}
    : () => {
        rowCount.current += 1;
      };

  return (
    <TableColumnWidthContext.Provider
      value={{
        gridTemplateColumns: '',
        setGridTemplateColumns: () => {},
        ...rest,
        rowCount,
        incrementRowCount,
      }}
    >
      {children}
    </TableColumnWidthContext.Provider>
  );
};

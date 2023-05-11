/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

/** @internal */
export function Header(props: { title: string; subtitle: string; value: string; target?: string }) {
  return (
    <div className="echBulletGraphHeader echBulletGraphHeader--multi">
      <h2 className="echBulletGraphHeader__title">{props.title}</h2>
      <div className="echBulletGraphHeader--single">
        <p className="echBulletGraphHeader__subtitle">{props.subtitle}</p>
        <p className="echBulletHeader__valueContainer">
          <span className="echBulletHeader__value">{props.value}</span>
          {props.target ? <span className="echBulletHeader__target"> / {props.target}</span> : ''}
        </p>
      </div>
    </div>
  );
}

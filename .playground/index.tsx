import '@babel/polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import '../src/theme_light.scss';
import { Playground } from './playgroud';

import 'date-time-format-timezone';

import './test_zones';

ReactDOM.render(<Playground />, document.getElementById('root') as HTMLElement);

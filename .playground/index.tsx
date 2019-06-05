import '@babel/polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import '../src/reset_light.scss';
import '../src/theme_light.scss';
import { Playground } from './playgroud';

ReactDOM.render(<Playground />, document.getElementById('root') as HTMLElement);

/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { NavRect } from './flame_chart';

function isZoomPanNav(nav?: NavRect) {
  return nav && Number.isNaN(nav.index);
}

/** @internal */
export abstract class NavigationStrategy {
  navIndex = 0;
  navQueue: NavRect[] = [];
  root: NavRect;
  lastZoom: NavRect | undefined;

  constructor(root: NavRect) {
    this.root = root;
    this.navQueue.push(this.root);
  }

  abstract add(toAdd: NavRect): void;

  navForward() {
    if (!this.canNavForward()) {
      return;
    }
    this.navIndex++;
    return this.current();
  }

  navBackward() {
    if (!this.canNavBackward()) {
      return;
    }
    this.navIndex--;
    return this.current();
  }

  canNavForward = () => this.navIndex < this.navQueue.length - 1;

  canNavBackward = () => this.navQueue.length > 0 && this.navIndex > 0;

  current = (): NavRect | undefined => this.navQueue[this.navIndex];

  next = (): NavRect | undefined => this.navQueue[this.navIndex + 1];

  prev = (): NavRect | undefined => this.navQueue[this.navIndex - 1];

  reset() {
    this.navIndex = 0;
    this.navQueue.splice(this.navIndex, Infinity, this.root);
  }

  backToTop = () => (this.navIndex = 0);

  queue = () => this.navQueue;

  index = () => this.navIndex;

  lastInQueue = () => this.navIndex === this.navQueue.length - 1;
}

/**
 * Insert a click event between the current history item and the next one.
 * @internal
 */
export class InsertClicksEverywhere extends NavigationStrategy {
  add(toAdd: NavRect) {
    if (isZoomPanNav(toAdd)) {
      return;
    }
    if (this.current()?.index !== toAdd.index) {
      this.navQueue.splice(++this.navIndex, 0, toAdd);
    }
  }
}

/**
 * Add a click event after the current history item, and clear the rest of the history from here.
 * @internal
 */
export class ClearQueueTipAndAddClick extends NavigationStrategy {
  add(toAdd: NavRect) {
    if (isZoomPanNav(toAdd)) {
      return;
    }
    if (this.current()?.index !== toAdd.index) {
      this.navQueue.splice(++this.navIndex, Infinity, toAdd);
    }
  }
}

/**
 * Same as ClearQueueTipAndAddClick but  includes zoom/pan events only at the tip of the queue
 * @internal
 */
export class PushZoomPanToQueueTip extends NavigationStrategy {
  add(toAdd: NavRect) {
    if (isZoomPanNav(toAdd)) {
      // do not add zoom/pan event if not at the end of the queue
      if (!this.lastInQueue()) {
        return;
      } else {
        // at the end of the queue, add the zoom event
        if (isZoomPanNav(this.current())) {
          // update the zoom event if the last is zoom
          this.navQueue.splice(this.navIndex, 1, toAdd);
        } else {
          // add only at the last place
          this.navQueue.splice(++this.navIndex, 0, toAdd);
        }
      }
    } else {
      if (this.lastInQueue()) {
        if (isZoomPanNav(this.current())) {
          // replace if last is zoom
          this.navQueue.splice(this.navIndex, 1, toAdd);
        } else {
          // add only if differ from current
          if (this.current()?.index !== toAdd.index) {
            this.navQueue.splice(++this.navIndex, 0, toAdd);
          }
        }
      } else {
        // add only if differ from current
        if (this.current()?.index !== toAdd.index) {
          this.navQueue.splice(++this.navIndex, Infinity, toAdd);
        }
      }
    }
  }
}

/**
 * Add Zoom/Pan events when back/forward button are clicked
 * @internal
 */
export class NavButtonControlledZoomPanHistory extends NavigationStrategy {
  navForward() {
    if (!this.canNavForward()) {
      return;
    }
    if (this.lastZoom) {
      this.navQueue.splice(++this.navIndex, 0, { ...this.lastZoom });
      this.lastZoom = undefined;
    }
    this.navIndex++;
    return this.current();
  }

  navBackward() {
    if (!this.canNavBackward()) {
      return;
    }
    if (this.lastZoom) {
      this.navQueue.splice(++this.navIndex, 0, { ...this.lastZoom });
      this.lastZoom = undefined;
    }
    this.navIndex--;
    return this.current();
  }

  add(toAdd: NavRect) {
    if (isZoomPanNav(toAdd)) {
      this.lastZoom = { ...toAdd };
    } else {
      this.lastZoom = undefined;
      if (this.current()?.index !== toAdd.index) {
        this.navQueue.splice(++this.navIndex, Infinity, toAdd);
      }
    }
  }
}

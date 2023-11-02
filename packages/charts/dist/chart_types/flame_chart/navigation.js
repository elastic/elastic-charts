"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NavButtonControlledZoomPanHistory = exports.PushZoomPanToQueueTip = exports.ClearQueueTipAndAddClick = exports.InsertClicksEverywhere = exports.NavigationStrategy = void 0;
function isZoomPanNav(nav) {
    return nav && Number.isNaN(nav.index);
}
class NavigationStrategy {
    constructor(root) {
        this.navIndex = 0;
        this.navQueue = [];
        this.canNavForward = () => this.navIndex < this.navQueue.length - 1;
        this.canNavBackward = () => this.navQueue.length > 0 && this.navIndex > 0;
        this.current = () => this.navQueue[this.navIndex];
        this.next = () => this.navQueue[this.navIndex + 1];
        this.prev = () => this.navQueue[this.navIndex - 1];
        this.backToTop = () => (this.navIndex = 0);
        this.queue = () => this.navQueue;
        this.index = () => this.navIndex;
        this.lastInQueue = () => this.navIndex === this.navQueue.length - 1;
        this.root = root;
        this.navQueue.push(this.root);
    }
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
    reset() {
        this.navIndex = 0;
        this.navQueue.splice(this.navIndex, Infinity, this.root);
    }
}
exports.NavigationStrategy = NavigationStrategy;
class InsertClicksEverywhere extends NavigationStrategy {
    add(toAdd) {
        var _a;
        if (isZoomPanNav(toAdd)) {
            return;
        }
        if (((_a = this.current()) === null || _a === void 0 ? void 0 : _a.index) !== toAdd.index) {
            this.navQueue.splice(++this.navIndex, 0, toAdd);
        }
    }
}
exports.InsertClicksEverywhere = InsertClicksEverywhere;
class ClearQueueTipAndAddClick extends NavigationStrategy {
    add(toAdd) {
        var _a;
        if (isZoomPanNav(toAdd)) {
            return;
        }
        if (((_a = this.current()) === null || _a === void 0 ? void 0 : _a.index) !== toAdd.index) {
            this.navQueue.splice(++this.navIndex, Infinity, toAdd);
        }
    }
}
exports.ClearQueueTipAndAddClick = ClearQueueTipAndAddClick;
class PushZoomPanToQueueTip extends NavigationStrategy {
    add(toAdd) {
        var _a, _b;
        if (isZoomPanNav(toAdd)) {
            if (!this.lastInQueue()) {
                return;
            }
            else {
                if (isZoomPanNav(this.current())) {
                    this.navQueue.splice(this.navIndex, 1, toAdd);
                }
                else {
                    this.navQueue.splice(++this.navIndex, 0, toAdd);
                }
            }
        }
        else {
            if (this.lastInQueue()) {
                if (isZoomPanNav(this.current())) {
                    this.navQueue.splice(this.navIndex, 1, toAdd);
                }
                else {
                    if (((_a = this.current()) === null || _a === void 0 ? void 0 : _a.index) !== toAdd.index) {
                        this.navQueue.splice(++this.navIndex, 0, toAdd);
                    }
                }
            }
            else {
                if (((_b = this.current()) === null || _b === void 0 ? void 0 : _b.index) !== toAdd.index) {
                    this.navQueue.splice(++this.navIndex, Infinity, toAdd);
                }
            }
        }
    }
}
exports.PushZoomPanToQueueTip = PushZoomPanToQueueTip;
class NavButtonControlledZoomPanHistory extends NavigationStrategy {
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
    add(toAdd) {
        var _a;
        if (isZoomPanNav(toAdd)) {
            this.lastZoom = { ...toAdd };
        }
        else {
            this.lastZoom = undefined;
            if (((_a = this.current()) === null || _a === void 0 ? void 0 : _a.index) !== toAdd.index) {
                this.navQueue.splice(++this.navIndex, Infinity, toAdd);
            }
        }
    }
}
exports.NavButtonControlledZoomPanHistory = NavButtonControlledZoomPanHistory;
//# sourceMappingURL=navigation.js.map
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NavButtonControlledZoomPanHistory = exports.PushZoomPanToQueueTip = exports.ClearQueueTipAndAddClick = exports.InsertClicksEverywhere = exports.NavigationStrategy = void 0;
function isZoomPanNav(nav) {
    return nav && Number.isNaN(nav.index);
}
var NavigationStrategy = (function () {
    function NavigationStrategy(root) {
        var _this = this;
        this.navIndex = 0;
        this.navQueue = [];
        this.canNavForward = function () { return _this.navIndex < _this.navQueue.length - 1; };
        this.canNavBackward = function () { return _this.navQueue.length > 0 && _this.navIndex > 0; };
        this.current = function () { return _this.navQueue[_this.navIndex]; };
        this.next = function () { return _this.navQueue[_this.navIndex + 1]; };
        this.prev = function () { return _this.navQueue[_this.navIndex - 1]; };
        this.backToTop = function () { return (_this.navIndex = 0); };
        this.queue = function () { return _this.navQueue; };
        this.index = function () { return _this.navIndex; };
        this.lastInQueue = function () { return _this.navIndex === _this.navQueue.length - 1; };
        this.root = root;
        this.navQueue.push(this.root);
    }
    NavigationStrategy.prototype.navForward = function () {
        if (!this.canNavForward()) {
            return;
        }
        this.navIndex++;
        return this.current();
    };
    NavigationStrategy.prototype.navBackward = function () {
        if (!this.canNavBackward()) {
            return;
        }
        this.navIndex--;
        return this.current();
    };
    NavigationStrategy.prototype.reset = function () {
        this.navIndex = 0;
        this.navQueue.splice(this.navIndex, Infinity, this.root);
    };
    return NavigationStrategy;
}());
exports.NavigationStrategy = NavigationStrategy;
var InsertClicksEverywhere = (function (_super) {
    __extends(InsertClicksEverywhere, _super);
    function InsertClicksEverywhere() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    InsertClicksEverywhere.prototype.add = function (toAdd) {
        var _a;
        if (isZoomPanNav(toAdd)) {
            return;
        }
        if (((_a = this.current()) === null || _a === void 0 ? void 0 : _a.index) !== toAdd.index) {
            this.navQueue.splice(++this.navIndex, 0, toAdd);
        }
    };
    return InsertClicksEverywhere;
}(NavigationStrategy));
exports.InsertClicksEverywhere = InsertClicksEverywhere;
var ClearQueueTipAndAddClick = (function (_super) {
    __extends(ClearQueueTipAndAddClick, _super);
    function ClearQueueTipAndAddClick() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ClearQueueTipAndAddClick.prototype.add = function (toAdd) {
        var _a;
        if (isZoomPanNav(toAdd)) {
            return;
        }
        if (((_a = this.current()) === null || _a === void 0 ? void 0 : _a.index) !== toAdd.index) {
            this.navQueue.splice(++this.navIndex, Infinity, toAdd);
        }
    };
    return ClearQueueTipAndAddClick;
}(NavigationStrategy));
exports.ClearQueueTipAndAddClick = ClearQueueTipAndAddClick;
var PushZoomPanToQueueTip = (function (_super) {
    __extends(PushZoomPanToQueueTip, _super);
    function PushZoomPanToQueueTip() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PushZoomPanToQueueTip.prototype.add = function (toAdd) {
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
    };
    return PushZoomPanToQueueTip;
}(NavigationStrategy));
exports.PushZoomPanToQueueTip = PushZoomPanToQueueTip;
var NavButtonControlledZoomPanHistory = (function (_super) {
    __extends(NavButtonControlledZoomPanHistory, _super);
    function NavButtonControlledZoomPanHistory() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NavButtonControlledZoomPanHistory.prototype.navForward = function () {
        if (!this.canNavForward()) {
            return;
        }
        if (this.lastZoom) {
            this.navQueue.splice(++this.navIndex, 0, __assign({}, this.lastZoom));
            this.lastZoom = undefined;
        }
        this.navIndex++;
        return this.current();
    };
    NavButtonControlledZoomPanHistory.prototype.navBackward = function () {
        if (!this.canNavBackward()) {
            return;
        }
        if (this.lastZoom) {
            this.navQueue.splice(++this.navIndex, 0, __assign({}, this.lastZoom));
            this.lastZoom = undefined;
        }
        this.navIndex--;
        return this.current();
    };
    NavButtonControlledZoomPanHistory.prototype.add = function (toAdd) {
        var _a;
        if (isZoomPanNav(toAdd)) {
            this.lastZoom = __assign({}, toAdd);
        }
        else {
            this.lastZoom = undefined;
            if (((_a = this.current()) === null || _a === void 0 ? void 0 : _a.index) !== toAdd.index) {
                this.navQueue.splice(++this.navIndex, Infinity, toAdd);
            }
        }
    };
    return NavButtonControlledZoomPanHistory;
}(NavigationStrategy));
exports.NavButtonControlledZoomPanHistory = NavButtonControlledZoomPanHistory;
//# sourceMappingURL=navigation.js.map
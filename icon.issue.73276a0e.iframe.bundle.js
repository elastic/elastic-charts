(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["icon.issue"],{

/***/ "../node_modules/@elastic/eui/es/components/icon/assets/issue.js":
/*!***********************************************************************!*\
  !*** ../node_modules/@elastic/eui/es/components/icon/assets/issue.js ***!
  \***********************************************************************/
/*! exports provided: icon */
/*! all exports used */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "icon", function() { return icon; });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "../node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _services__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../services */ "../node_modules/@elastic/eui/es/services/accessibility/html_id_generator.js");
/* harmony import */ var _emotion_react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @emotion/react */ "../node_modules/@emotion/react/dist/emotion-react.browser.esm.js");
var _excluded = ["title", "titleId"];

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */
// THIS IS A GENERATED FILE. DO NOT MODIFY MANUALLY. @see scripts/compile-icons.js




var EuiIconIssue = function EuiIconIssue(_ref) {
  var title = _ref.title,
      titleId = _ref.titleId,
      props = _objectWithoutProperties(_ref, _excluded);

  var generateId = Object(_services__WEBPACK_IMPORTED_MODULE_1__[/* htmlIdGenerator */ "a"])('issue');
  return Object(_emotion_react__WEBPACK_IMPORTED_MODULE_2__[/* jsx */ "d"])("svg", _extends({
    width: 16,
    height: 16,
    viewBox: "0 0 16 16",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-labelledby": titleId
  }, props), title ? Object(_emotion_react__WEBPACK_IMPORTED_MODULE_2__[/* jsx */ "d"])("title", {
    id: titleId
  }, title) : null, Object(_emotion_react__WEBPACK_IMPORTED_MODULE_2__[/* jsx */ "d"])("g", {
    clipPath: "url(#".concat(generateId('a'), ")"),
    fill: "#343741"
  }, Object(_emotion_react__WEBPACK_IMPORTED_MODULE_2__[/* jsx */ "d"])("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M8 .5c4.136 0 7.5 3.364 7.5 7.5s-3.364 7.5-7.5 7.5S.5 12.136.5 8 3.864.5 8 .5zm0 .882a6.618 6.618 0 100 13.236A6.618 6.618 0 008 1.382z"
  }), Object(_emotion_react__WEBPACK_IMPORTED_MODULE_2__[/* jsx */ "d"])("path", {
    d: "M9 8a1 1 0 11-2 0 1 1 0 012 0z"
  })), Object(_emotion_react__WEBPACK_IMPORTED_MODULE_2__[/* jsx */ "d"])("clipPath", {
    id: generateId('a')
  }, Object(_emotion_react__WEBPACK_IMPORTED_MODULE_2__[/* jsx */ "d"])("path", {
    d: "M0 0h16v16H0z"
  })));
};

var icon = EuiIconIssue;

/***/ })

}]);
//# sourceMappingURL=icon.issue.73276a0e.iframe.bundle.js.map
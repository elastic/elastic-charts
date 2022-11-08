(window["webpackJsonp"] = window["webpackJsonp"] || []).push([[2],{

/***/ "../node_modules/@storybook/components/dist/esm/controls/Color.js":
/*!************************************************************************!*\
  !*** ../node_modules/@storybook/components/dist/esm/controls/Color.js ***!
  \************************************************************************/
/*! exports provided: ColorControl, default */
/*! all exports used */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ColorControl", function() { return ColorControl; });
/* harmony import */ var core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! core-js/modules/es.object.keys.js */ "../node_modules/core-js/modules/es.object.keys.js");
/* harmony import */ var core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! core-js/modules/es.symbol.js */ "../node_modules/core-js/modules/es.symbol.js");
/* harmony import */ var core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! core-js/modules/es.symbol.description.js */ "../node_modules/core-js/modules/es.symbol.description.js");
/* harmony import */ var core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! core-js/modules/es.object.to-string.js */ "../node_modules/core-js/modules/es.object.to-string.js");
/* harmony import */ var core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! core-js/modules/es.symbol.iterator.js */ "../node_modules/core-js/modules/es.symbol.iterator.js");
/* harmony import */ var core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_iterator_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! core-js/modules/es.string.iterator.js */ "../node_modules/core-js/modules/es.string.iterator.js");
/* harmony import */ var core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_string_iterator_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! core-js/modules/es.array.iterator.js */ "../node_modules/core-js/modules/es.array.iterator.js");
/* harmony import */ var core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! core-js/modules/web.dom-collections.iterator.js */ "../node_modules/core-js/modules/web.dom-collections.iterator.js");
/* harmony import */ var core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! core-js/modules/es.array.from.js */ "../node_modules/core-js/modules/es.array.from.js");
/* harmony import */ var core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_from_js__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var core_js_modules_es_array_concat_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! core-js/modules/es.array.concat.js */ "../node_modules/core-js/modules/es.array.concat.js");
/* harmony import */ var core_js_modules_es_array_concat_js__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_concat_js__WEBPACK_IMPORTED_MODULE_9__);
/* harmony import */ var core_js_modules_es_object_assign_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! core-js/modules/es.object.assign.js */ "../node_modules/core-js/modules/es.object.assign.js");
/* harmony import */ var core_js_modules_es_object_assign_js__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_assign_js__WEBPACK_IMPORTED_MODULE_10__);
/* harmony import */ var core_js_modules_es_object_values_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! core-js/modules/es.object.values.js */ "../node_modules/core-js/modules/es.object.values.js");
/* harmony import */ var core_js_modules_es_object_values_js__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_values_js__WEBPACK_IMPORTED_MODULE_11__);
/* harmony import */ var core_js_modules_es_string_match_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! core-js/modules/es.string.match.js */ "../node_modules/core-js/modules/es.string.match.js");
/* harmony import */ var core_js_modules_es_string_match_js__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_string_match_js__WEBPACK_IMPORTED_MODULE_12__);
/* harmony import */ var core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! core-js/modules/es.regexp.exec.js */ "../node_modules/core-js/modules/es.regexp.exec.js");
/* harmony import */ var core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_13___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_13__);
/* harmony import */ var core_js_modules_es_array_map_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! core-js/modules/es.array.map.js */ "../node_modules/core-js/modules/es.array.map.js");
/* harmony import */ var core_js_modules_es_array_map_js__WEBPACK_IMPORTED_MODULE_14___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_map_js__WEBPACK_IMPORTED_MODULE_14__);
/* harmony import */ var core_js_modules_es_number_constructor_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! core-js/modules/es.number.constructor.js */ "../node_modules/core-js/modules/es.number.constructor.js");
/* harmony import */ var core_js_modules_es_number_constructor_js__WEBPACK_IMPORTED_MODULE_15___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_number_constructor_js__WEBPACK_IMPORTED_MODULE_15__);
/* harmony import */ var core_js_modules_es_string_replace_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! core-js/modules/es.string.replace.js */ "../node_modules/core-js/modules/es.string.replace.js");
/* harmony import */ var core_js_modules_es_string_replace_js__WEBPACK_IMPORTED_MODULE_16___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_string_replace_js__WEBPACK_IMPORTED_MODULE_16__);
/* harmony import */ var core_js_modules_es_string_starts_with_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! core-js/modules/es.string.starts-with.js */ "../node_modules/core-js/modules/es.string.starts-with.js");
/* harmony import */ var core_js_modules_es_string_starts_with_js__WEBPACK_IMPORTED_MODULE_17___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_string_starts_with_js__WEBPACK_IMPORTED_MODULE_17__);
/* harmony import */ var core_js_modules_es_string_split_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! core-js/modules/es.string.split.js */ "../node_modules/core-js/modules/es.string.split.js");
/* harmony import */ var core_js_modules_es_string_split_js__WEBPACK_IMPORTED_MODULE_18___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_string_split_js__WEBPACK_IMPORTED_MODULE_18__);
/* harmony import */ var core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! core-js/modules/es.array.slice.js */ "../node_modules/core-js/modules/es.array.slice.js");
/* harmony import */ var core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_19___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_slice_js__WEBPACK_IMPORTED_MODULE_19__);
/* harmony import */ var core_js_modules_es_array_filter_js__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! core-js/modules/es.array.filter.js */ "../node_modules/core-js/modules/es.array.filter.js");
/* harmony import */ var core_js_modules_es_array_filter_js__WEBPACK_IMPORTED_MODULE_20___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_filter_js__WEBPACK_IMPORTED_MODULE_20__);
/* harmony import */ var core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! core-js/modules/es.function.name.js */ "../node_modules/core-js/modules/es.function.name.js");
/* harmony import */ var core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_21___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_21__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! react */ "../node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_22___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_22__);
/* harmony import */ var react_colorful__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! react-colorful */ "../node_modules/react-colorful/dist/index.module.js");
/* harmony import */ var color_convert__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! color-convert */ "../node_modules/@storybook/components/node_modules/color-convert/index.js");
/* harmony import */ var color_convert__WEBPACK_IMPORTED_MODULE_24___default = /*#__PURE__*/__webpack_require__.n(color_convert__WEBPACK_IMPORTED_MODULE_24__);
/* harmony import */ var lodash_throttle__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! lodash/throttle */ "../node_modules/lodash/throttle.js");
/* harmony import */ var lodash_throttle__WEBPACK_IMPORTED_MODULE_25___default = /*#__PURE__*/__webpack_require__.n(lodash_throttle__WEBPACK_IMPORTED_MODULE_25__);
/* harmony import */ var _storybook_theming__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! @storybook/theming */ "../node_modules/@storybook/theming/dist/esm/index.js");
/* harmony import */ var _tooltip_TooltipNote__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! ../tooltip/TooltipNote */ "../node_modules/@storybook/components/dist/esm/tooltip/TooltipNote.js");
/* harmony import */ var _tooltip_lazy_WithTooltip__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! ../tooltip/lazy-WithTooltip */ "../node_modules/@storybook/components/dist/esm/tooltip/lazy-WithTooltip.js");
/* harmony import */ var _form__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(/*! ../form */ "../node_modules/@storybook/components/dist/esm/form/index.js");
/* harmony import */ var _icon_icon__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(/*! ../icon/icon */ "../node_modules/@storybook/components/dist/esm/icon/icon.js");
/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_31__ = __webpack_require__(/*! ./helpers */ "../node_modules/@storybook/components/dist/esm/controls/helpers.js");










var _ColorPicker, _fallbackColor;

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }
























var Wrapper = _storybook_theming__WEBPACK_IMPORTED_MODULE_26__["styled"].div({
  position: 'relative',
  maxWidth: 250
});
var PickerTooltip = Object(_storybook_theming__WEBPACK_IMPORTED_MODULE_26__["styled"])(_tooltip_lazy_WithTooltip__WEBPACK_IMPORTED_MODULE_28__[/* WithTooltip */ "a"])({
  position: 'absolute',
  zIndex: 1,
  top: 4,
  left: 4
});
var TooltipContent = _storybook_theming__WEBPACK_IMPORTED_MODULE_26__["styled"].div({
  width: 200,
  margin: 5,
  '.react-colorful__saturation': {
    borderRadius: '4px 4px 0 0'
  },
  '.react-colorful__hue': {
    boxShadow: 'inset 0 0 0 1px rgb(0 0 0 / 5%)'
  },
  '.react-colorful__last-control': {
    borderRadius: '0 0 4px 4px'
  }
});
var Note = Object(_storybook_theming__WEBPACK_IMPORTED_MODULE_26__["styled"])(_tooltip_TooltipNote__WEBPACK_IMPORTED_MODULE_27__[/* TooltipNote */ "a"])(function (_ref) {
  var theme = _ref.theme;
  return {
    fontFamily: theme.typography.fonts.base
  };
});
var Swatches = _storybook_theming__WEBPACK_IMPORTED_MODULE_26__["styled"].div({
  display: 'grid',
  gridTemplateColumns: 'repeat(9, 16px)',
  gap: 6,
  padding: 3,
  marginTop: 5,
  width: 200
});
var SwatchColor = _storybook_theming__WEBPACK_IMPORTED_MODULE_26__["styled"].div(function (_ref2) {
  var theme = _ref2.theme,
      active = _ref2.active;
  return {
    width: 16,
    height: 16,
    boxShadow: active ? "".concat(theme.appBorderColor, " 0 0 0 1px inset, ").concat(theme.color.mediumdark, "50 0 0 0 4px") : "".concat(theme.appBorderColor, " 0 0 0 1px inset"),
    borderRadius: theme.appBorderRadius
  };
});
var swatchBackground = "url('data:image/svg+xml;charset=utf-8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill-opacity=\".05\"><path d=\"M8 0h8v8H8zM0 8h8v8H0z\"/></svg>')";

var Swatch = function Swatch(_ref3) {
  var value = _ref3.value,
      active = _ref3.active,
      onClick = _ref3.onClick,
      style = _ref3.style,
      props = _objectWithoutProperties(_ref3, ["value", "active", "onClick", "style"]);

  var backgroundImage = "linear-gradient(".concat(value, ", ").concat(value, "), ").concat(swatchBackground, ", linear-gradient(#fff, #fff)");
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22___default.a.createElement(SwatchColor, _extends({}, props, {
    active: active,
    onClick: onClick,
    style: Object.assign({}, style, {
      backgroundImage: backgroundImage
    })
  }));
};

Swatch.displayName = "Swatch";
var Input = Object(_storybook_theming__WEBPACK_IMPORTED_MODULE_26__["styled"])(_form__WEBPACK_IMPORTED_MODULE_29__[/* Form */ "a"].Input)(function (_ref4) {
  var theme = _ref4.theme;
  return {
    width: '100%',
    paddingLeft: 30,
    paddingRight: 30,
    boxSizing: 'border-box',
    fontFamily: theme.typography.fonts.base
  };
});
var ToggleIcon = Object(_storybook_theming__WEBPACK_IMPORTED_MODULE_26__["styled"])(_icon_icon__WEBPACK_IMPORTED_MODULE_30__[/* Icons */ "a"])(function (_ref5) {
  var theme = _ref5.theme;
  return {
    position: 'absolute',
    zIndex: 1,
    top: 6,
    right: 7,
    width: 20,
    height: 20,
    padding: 4,
    boxSizing: 'border-box',
    cursor: 'pointer',
    color: theme.input.color
  };
});
var ColorSpace;

(function (ColorSpace) {
  ColorSpace["RGB"] = "rgb";
  ColorSpace["HSL"] = "hsl";
  ColorSpace["HEX"] = "hex";
})(ColorSpace || (ColorSpace = {}));

var COLOR_SPACES = Object.values(ColorSpace);
var COLOR_REGEXP = /\(([0-9]+),\s*([0-9]+)%?,\s*([0-9]+)%?,?\s*([0-9.]+)?\)/;
var RGB_REGEXP = /^\s*rgba?\(([0-9]+),\s*([0-9]+),\s*([0-9]+),?\s*([0-9.]+)?\)\s*$/i;
var HSL_REGEXP = /^\s*hsla?\(([0-9]+),\s*([0-9]+)%,\s*([0-9]+)%,?\s*([0-9.]+)?\)\s*$/i;
var HEX_REGEXP = /^\s*#?([0-9a-f]{3}|[0-9a-f]{6})\s*$/i;
var SHORTHEX_REGEXP = /^\s*#?([0-9a-f]{3})\s*$/i;
var ColorPicker = (_ColorPicker = {}, _defineProperty(_ColorPicker, ColorSpace.HEX, react_colorful__WEBPACK_IMPORTED_MODULE_23__[/* HexColorPicker */ "a"]), _defineProperty(_ColorPicker, ColorSpace.RGB, react_colorful__WEBPACK_IMPORTED_MODULE_23__[/* RgbaStringColorPicker */ "c"]), _defineProperty(_ColorPicker, ColorSpace.HSL, react_colorful__WEBPACK_IMPORTED_MODULE_23__[/* HslaStringColorPicker */ "b"]), _ColorPicker);
var fallbackColor = (_fallbackColor = {}, _defineProperty(_fallbackColor, ColorSpace.HEX, 'transparent'), _defineProperty(_fallbackColor, ColorSpace.RGB, 'rgba(0, 0, 0, 0)'), _defineProperty(_fallbackColor, ColorSpace.HSL, 'hsla(0, 0%, 0%, 0)'), _fallbackColor);

var stringToArgs = function stringToArgs(value) {
  var match = value === null || value === void 0 ? void 0 : value.match(COLOR_REGEXP);
  if (!match) return [0, 0, 0, 1];

  var _match = _slicedToArray(match, 5),
      x = _match[1],
      y = _match[2],
      z = _match[3],
      _match$ = _match[4],
      a = _match$ === void 0 ? 1 : _match$;

  return [x, y, z, a].map(Number);
};

var parseValue = function parseValue(value) {
  var _ref12;

  if (!value) return undefined;
  var valid = true;

  if (RGB_REGEXP.test(value)) {
    var _ref8;

    var _stringToArgs = stringToArgs(value),
        _stringToArgs2 = _slicedToArray(_stringToArgs, 4),
        r = _stringToArgs2[0],
        g = _stringToArgs2[1],
        b = _stringToArgs2[2],
        a = _stringToArgs2[3];

    var _ref6 = color_convert__WEBPACK_IMPORTED_MODULE_24___default.a.rgb.hsl([r, g, b]) || [0, 0, 0],
        _ref7 = _slicedToArray(_ref6, 3),
        h = _ref7[0],
        s = _ref7[1],
        l = _ref7[2];

    return _ref8 = {
      valid: valid,
      value: value,
      keyword: color_convert__WEBPACK_IMPORTED_MODULE_24___default.a.rgb.keyword([r, g, b]),
      colorSpace: ColorSpace.RGB
    }, _defineProperty(_ref8, ColorSpace.RGB, value), _defineProperty(_ref8, ColorSpace.HSL, "hsla(".concat(h, ", ").concat(s, "%, ").concat(l, "%, ").concat(a, ")")), _defineProperty(_ref8, ColorSpace.HEX, "#".concat(color_convert__WEBPACK_IMPORTED_MODULE_24___default.a.rgb.hex([r, g, b]).toLowerCase())), _ref8;
  }

  if (HSL_REGEXP.test(value)) {
    var _ref11;

    var _stringToArgs3 = stringToArgs(value),
        _stringToArgs4 = _slicedToArray(_stringToArgs3, 4),
        _h = _stringToArgs4[0],
        _s2 = _stringToArgs4[1],
        _l = _stringToArgs4[2],
        _a = _stringToArgs4[3];

    var _ref9 = color_convert__WEBPACK_IMPORTED_MODULE_24___default.a.hsl.rgb([_h, _s2, _l]) || [0, 0, 0],
        _ref10 = _slicedToArray(_ref9, 3),
        _r = _ref10[0],
        _g = _ref10[1],
        _b = _ref10[2];

    return _ref11 = {
      valid: valid,
      value: value,
      keyword: color_convert__WEBPACK_IMPORTED_MODULE_24___default.a.hsl.keyword([_h, _s2, _l]),
      colorSpace: ColorSpace.HSL
    }, _defineProperty(_ref11, ColorSpace.RGB, "rgba(".concat(_r, ", ").concat(_g, ", ").concat(_b, ", ").concat(_a, ")")), _defineProperty(_ref11, ColorSpace.HSL, value), _defineProperty(_ref11, ColorSpace.HEX, "#".concat(color_convert__WEBPACK_IMPORTED_MODULE_24___default.a.hsl.hex([_h, _s2, _l]).toLowerCase())), _ref11;
  }

  var plain = value.replace('#', '');
  var rgb = color_convert__WEBPACK_IMPORTED_MODULE_24___default.a.keyword.rgb(plain) || color_convert__WEBPACK_IMPORTED_MODULE_24___default.a.hex.rgb(plain);
  var hsl = color_convert__WEBPACK_IMPORTED_MODULE_24___default.a.rgb.hsl(rgb);
  var mapped = value;
  if (/[^#a-f0-9]/i.test(value)) mapped = plain;else if (HEX_REGEXP.test(value)) mapped = "#".concat(plain);

  if (mapped.startsWith('#')) {
    valid = HEX_REGEXP.test(mapped);
  } else {
    try {
      color_convert__WEBPACK_IMPORTED_MODULE_24___default.a.keyword.hex(mapped);
    } catch (e) {
      valid = false;
    }
  }

  return _ref12 = {
    valid: valid,
    value: mapped,
    keyword: color_convert__WEBPACK_IMPORTED_MODULE_24___default.a.rgb.keyword(rgb),
    colorSpace: ColorSpace.HEX
  }, _defineProperty(_ref12, ColorSpace.RGB, "rgba(".concat(rgb[0], ", ").concat(rgb[1], ", ").concat(rgb[2], ", 1)")), _defineProperty(_ref12, ColorSpace.HSL, "hsla(".concat(hsl[0], ", ").concat(hsl[1], "%, ").concat(hsl[2], "%, 1)")), _defineProperty(_ref12, ColorSpace.HEX, mapped), _ref12;
};

var getRealValue = function getRealValue(value, color, colorSpace) {
  if (!value || !(color !== null && color !== void 0 && color.valid)) return fallbackColor[colorSpace];
  if (colorSpace !== ColorSpace.HEX) return (color === null || color === void 0 ? void 0 : color[colorSpace]) || fallbackColor[colorSpace];

  if (!color.hex.startsWith('#')) {
    try {
      return "#".concat(color_convert__WEBPACK_IMPORTED_MODULE_24___default.a.keyword.hex(color.hex));
    } catch (e) {
      return fallbackColor.hex;
    }
  }

  var short = color.hex.match(SHORTHEX_REGEXP);
  if (!short) return HEX_REGEXP.test(color.hex) ? color.hex : fallbackColor.hex;

  var _short$1$split = short[1].split(''),
      _short$1$split2 = _slicedToArray(_short$1$split, 3),
      r = _short$1$split2[0],
      g = _short$1$split2[1],
      b = _short$1$split2[2];

  return "#".concat(r).concat(r).concat(g).concat(g).concat(b).concat(b);
};

var useColorInput = function useColorInput(initialValue, onChange) {
  var _useState = Object(react__WEBPACK_IMPORTED_MODULE_22__["useState"])(initialValue || ''),
      _useState2 = _slicedToArray(_useState, 2),
      value = _useState2[0],
      setValue = _useState2[1];

  var _useState3 = Object(react__WEBPACK_IMPORTED_MODULE_22__["useState"])(function () {
    return parseValue(value);
  }),
      _useState4 = _slicedToArray(_useState3, 2),
      color = _useState4[0],
      setColor = _useState4[1];

  var _useState5 = Object(react__WEBPACK_IMPORTED_MODULE_22__["useState"])((color === null || color === void 0 ? void 0 : color.colorSpace) || ColorSpace.HEX),
      _useState6 = _slicedToArray(_useState5, 2),
      colorSpace = _useState6[0],
      setColorSpace = _useState6[1]; // Reset state when initialValue becomes undefined (when resetting controls)


  Object(react__WEBPACK_IMPORTED_MODULE_22__["useEffect"])(function () {
    if (initialValue !== undefined) return;
    setValue('');
    setColor(undefined);
    setColorSpace(ColorSpace.HEX);
  }, [initialValue]);
  var realValue = Object(react__WEBPACK_IMPORTED_MODULE_22__["useMemo"])(function () {
    return getRealValue(value, color, colorSpace).toLowerCase();
  }, [value, color, colorSpace]);
  var updateValue = Object(react__WEBPACK_IMPORTED_MODULE_22__["useCallback"])(function (update) {
    var parsed = parseValue(update);
    setValue((parsed === null || parsed === void 0 ? void 0 : parsed.value) || update || '');
    if (!parsed) return;
    setColor(parsed);
    setColorSpace(parsed.colorSpace);
    onChange(parsed.value);
  }, [onChange]);
  var cycleColorSpace = Object(react__WEBPACK_IMPORTED_MODULE_22__["useCallback"])(function () {
    var next = COLOR_SPACES.indexOf(colorSpace) + 1;
    if (next >= COLOR_SPACES.length) next = 0;
    setColorSpace(COLOR_SPACES[next]);
    var update = (color === null || color === void 0 ? void 0 : color[COLOR_SPACES[next]]) || '';
    setValue(update);
    onChange(update);
  }, [color, colorSpace, onChange]);
  return {
    value: value,
    realValue: realValue,
    updateValue: updateValue,
    color: color,
    colorSpace: colorSpace,
    cycleColorSpace: cycleColorSpace
  };
};

var id = function id(value) {
  return value.replace(/\s*/, '').toLowerCase();
};

var usePresets = function usePresets(presetColors, currentColor, colorSpace) {
  var _useState7 = Object(react__WEBPACK_IMPORTED_MODULE_22__["useState"])(currentColor !== null && currentColor !== void 0 && currentColor.valid ? [currentColor] : []),
      _useState8 = _slicedToArray(_useState7, 2),
      selectedColors = _useState8[0],
      setSelectedColors = _useState8[1]; // Reset state when currentColor becomes undefined (when resetting controls)


  Object(react__WEBPACK_IMPORTED_MODULE_22__["useEffect"])(function () {
    if (currentColor !== undefined) return;
    setSelectedColors([]);
  }, [currentColor]);
  var presets = Object(react__WEBPACK_IMPORTED_MODULE_22__["useMemo"])(function () {
    var initialPresets = (presetColors || []).map(function (preset) {
      if (typeof preset === 'string') return parseValue(preset);
      if (preset.title) return Object.assign({}, parseValue(preset.color), {
        keyword: preset.title
      });
      return parseValue(preset.color);
    });
    return initialPresets.concat(selectedColors).filter(Boolean).slice(-27);
  }, [presetColors, selectedColors]);
  var addPreset = Object(react__WEBPACK_IMPORTED_MODULE_22__["useCallback"])(function (color) {
    if (!(color !== null && color !== void 0 && color.valid)) return;
    if (presets.some(function (preset) {
      return id(preset[colorSpace]) === id(color[colorSpace]);
    })) return;
    setSelectedColors(function (arr) {
      return arr.concat(color);
    });
  }, [colorSpace, presets]);
  return {
    presets: presets,
    addPreset: addPreset
  };
};

var ColorControl = function ColorControl(_ref13) {
  var name = _ref13.name,
      initialValue = _ref13.value,
      onChange = _ref13.onChange,
      onFocus = _ref13.onFocus,
      onBlur = _ref13.onBlur,
      presetColors = _ref13.presetColors,
      startOpen = _ref13.startOpen;

  var _useColorInput = useColorInput(initialValue, lodash_throttle__WEBPACK_IMPORTED_MODULE_25___default()(onChange, 200)),
      value = _useColorInput.value,
      realValue = _useColorInput.realValue,
      updateValue = _useColorInput.updateValue,
      color = _useColorInput.color,
      colorSpace = _useColorInput.colorSpace,
      cycleColorSpace = _useColorInput.cycleColorSpace;

  var _usePresets = usePresets(presetColors, color, colorSpace),
      presets = _usePresets.presets,
      addPreset = _usePresets.addPreset;

  var Picker = ColorPicker[colorSpace];
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22___default.a.createElement(Wrapper, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22___default.a.createElement(PickerTooltip, {
    trigger: "click",
    startOpen: startOpen,
    closeOnClick: true,
    onVisibilityChange: function onVisibilityChange() {
      return addPreset(color);
    },
    tooltip: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22___default.a.createElement(TooltipContent, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22___default.a.createElement(Picker, {
      color: realValue === 'transparent' ? '#000000' : realValue,
      onChange: updateValue,
      onFocus: onFocus,
      onBlur: onBlur
    }), presets.length > 0 && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22___default.a.createElement(Swatches, null, presets.map(function (preset, index) {
      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22___default.a.createElement(_tooltip_lazy_WithTooltip__WEBPACK_IMPORTED_MODULE_28__[/* WithTooltip */ "a"] // eslint-disable-next-line react/no-array-index-key
      , {
        key: "".concat(preset.value, "-").concat(index),
        hasChrome: false,
        tooltip: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22___default.a.createElement(Note, {
          note: preset.keyword || preset.value
        })
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22___default.a.createElement(Swatch, {
        value: preset[colorSpace],
        active: color && id(preset[colorSpace]) === id(color[colorSpace]),
        onClick: function onClick() {
          return updateValue(preset.value);
        }
      }));
    })))
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22___default.a.createElement(Swatch, {
    value: realValue,
    style: {
      margin: 4
    }
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22___default.a.createElement(Input, {
    id: Object(_helpers__WEBPACK_IMPORTED_MODULE_31__[/* getControlId */ "a"])(name),
    value: value,
    onChange: function onChange(e) {
      return updateValue(e.target.value);
    },
    onFocus: function onFocus(e) {
      return e.target.select();
    },
    placeholder: "Choose color..."
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_22___default.a.createElement(ToggleIcon, {
    icon: "markup",
    onClick: cycleColorSpace
  }));
};
ColorControl.displayName = "ColorControl";
/* harmony default export */ __webpack_exports__["default"] = (ColorControl);

/***/ }),

/***/ "../node_modules/@storybook/components/dist/esm/tooltip/TooltipNote.js":
/*!*****************************************************************************!*\
  !*** ../node_modules/@storybook/components/dist/esm/tooltip/TooltipNote.js ***!
  \*****************************************************************************/
/*! exports provided: TooltipNote */
/*! exports used: TooltipNote */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return TooltipNote; });
/* harmony import */ var core_js_modules_es_string_bold_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! core-js/modules/es.string.bold.js */ "../node_modules/core-js/modules/es.string.bold.js");
/* harmony import */ var core_js_modules_es_string_bold_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_string_bold_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! core-js/modules/es.object.keys.js */ "../node_modules/core-js/modules/es.object.keys.js");
/* harmony import */ var core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_keys_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! core-js/modules/es.symbol.js */ "../node_modules/core-js/modules/es.symbol.js");
/* harmony import */ var core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react */ "../node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _storybook_theming__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @storybook/theming */ "../node_modules/@storybook/theming/dist/esm/index.js");
function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }






var Note = _storybook_theming__WEBPACK_IMPORTED_MODULE_4__["styled"].div(function (_ref) {
  var theme = _ref.theme;
  return {
    padding: '2px 6px',
    lineHeight: '16px',
    fontSize: 10,
    fontWeight: theme.typography.weight.bold,
    color: theme.color.lightest,
    boxShadow: '0 0 5px 0 rgba(0, 0, 0, 0.3)',
    borderRadius: 4,
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    zIndex: -1,
    background: 'rgba(0, 0, 0, 0.4)',
    margin: 6
  };
});
var TooltipNote = function TooltipNote(_ref2) {
  var note = _ref2.note,
      props = _objectWithoutProperties(_ref2, ["note"]);

  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_3___default.a.createElement(Note, props, note);
};
TooltipNote.displayName = "TooltipNote";

/***/ }),

/***/ "../node_modules/@storybook/components/node_modules/color-convert/conversions.js":
/*!***************************************************************************************!*\
  !*** ../node_modules/@storybook/components/node_modules/color-convert/conversions.js ***!
  \***************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

/* MIT license */
/* eslint-disable no-mixed-operators */
const cssKeywords = __webpack_require__(/*! color-name */ "../node_modules/color-name/index.js");

// NOTE: conversions should only return primitive values (i.e. arrays, or
//       values that give correct `typeof` results).
//       do not use box values types (i.e. Number(), String(), etc.)

const reverseKeywords = {};
for (const key of Object.keys(cssKeywords)) {
	reverseKeywords[cssKeywords[key]] = key;
}

const convert = {
	rgb: {channels: 3, labels: 'rgb'},
	hsl: {channels: 3, labels: 'hsl'},
	hsv: {channels: 3, labels: 'hsv'},
	hwb: {channels: 3, labels: 'hwb'},
	cmyk: {channels: 4, labels: 'cmyk'},
	xyz: {channels: 3, labels: 'xyz'},
	lab: {channels: 3, labels: 'lab'},
	lch: {channels: 3, labels: 'lch'},
	hex: {channels: 1, labels: ['hex']},
	keyword: {channels: 1, labels: ['keyword']},
	ansi16: {channels: 1, labels: ['ansi16']},
	ansi256: {channels: 1, labels: ['ansi256']},
	hcg: {channels: 3, labels: ['h', 'c', 'g']},
	apple: {channels: 3, labels: ['r16', 'g16', 'b16']},
	gray: {channels: 1, labels: ['gray']}
};

module.exports = convert;

// Hide .channels and .labels properties
for (const model of Object.keys(convert)) {
	if (!('channels' in convert[model])) {
		throw new Error('missing channels property: ' + model);
	}

	if (!('labels' in convert[model])) {
		throw new Error('missing channel labels property: ' + model);
	}

	if (convert[model].labels.length !== convert[model].channels) {
		throw new Error('channel and label counts mismatch: ' + model);
	}

	const {channels, labels} = convert[model];
	delete convert[model].channels;
	delete convert[model].labels;
	Object.defineProperty(convert[model], 'channels', {value: channels});
	Object.defineProperty(convert[model], 'labels', {value: labels});
}

convert.rgb.hsl = function (rgb) {
	const r = rgb[0] / 255;
	const g = rgb[1] / 255;
	const b = rgb[2] / 255;
	const min = Math.min(r, g, b);
	const max = Math.max(r, g, b);
	const delta = max - min;
	let h;
	let s;

	if (max === min) {
		h = 0;
	} else if (r === max) {
		h = (g - b) / delta;
	} else if (g === max) {
		h = 2 + (b - r) / delta;
	} else if (b === max) {
		h = 4 + (r - g) / delta;
	}

	h = Math.min(h * 60, 360);

	if (h < 0) {
		h += 360;
	}

	const l = (min + max) / 2;

	if (max === min) {
		s = 0;
	} else if (l <= 0.5) {
		s = delta / (max + min);
	} else {
		s = delta / (2 - max - min);
	}

	return [h, s * 100, l * 100];
};

convert.rgb.hsv = function (rgb) {
	let rdif;
	let gdif;
	let bdif;
	let h;
	let s;

	const r = rgb[0] / 255;
	const g = rgb[1] / 255;
	const b = rgb[2] / 255;
	const v = Math.max(r, g, b);
	const diff = v - Math.min(r, g, b);
	const diffc = function (c) {
		return (v - c) / 6 / diff + 1 / 2;
	};

	if (diff === 0) {
		h = 0;
		s = 0;
	} else {
		s = diff / v;
		rdif = diffc(r);
		gdif = diffc(g);
		bdif = diffc(b);

		if (r === v) {
			h = bdif - gdif;
		} else if (g === v) {
			h = (1 / 3) + rdif - bdif;
		} else if (b === v) {
			h = (2 / 3) + gdif - rdif;
		}

		if (h < 0) {
			h += 1;
		} else if (h > 1) {
			h -= 1;
		}
	}

	return [
		h * 360,
		s * 100,
		v * 100
	];
};

convert.rgb.hwb = function (rgb) {
	const r = rgb[0];
	const g = rgb[1];
	let b = rgb[2];
	const h = convert.rgb.hsl(rgb)[0];
	const w = 1 / 255 * Math.min(r, Math.min(g, b));

	b = 1 - 1 / 255 * Math.max(r, Math.max(g, b));

	return [h, w * 100, b * 100];
};

convert.rgb.cmyk = function (rgb) {
	const r = rgb[0] / 255;
	const g = rgb[1] / 255;
	const b = rgb[2] / 255;

	const k = Math.min(1 - r, 1 - g, 1 - b);
	const c = (1 - r - k) / (1 - k) || 0;
	const m = (1 - g - k) / (1 - k) || 0;
	const y = (1 - b - k) / (1 - k) || 0;

	return [c * 100, m * 100, y * 100, k * 100];
};

function comparativeDistance(x, y) {
	/*
		See https://en.m.wikipedia.org/wiki/Euclidean_distance#Squared_Euclidean_distance
	*/
	return (
		((x[0] - y[0]) ** 2) +
		((x[1] - y[1]) ** 2) +
		((x[2] - y[2]) ** 2)
	);
}

convert.rgb.keyword = function (rgb) {
	const reversed = reverseKeywords[rgb];
	if (reversed) {
		return reversed;
	}

	let currentClosestDistance = Infinity;
	let currentClosestKeyword;

	for (const keyword of Object.keys(cssKeywords)) {
		const value = cssKeywords[keyword];

		// Compute comparative distance
		const distance = comparativeDistance(rgb, value);

		// Check if its less, if so set as closest
		if (distance < currentClosestDistance) {
			currentClosestDistance = distance;
			currentClosestKeyword = keyword;
		}
	}

	return currentClosestKeyword;
};

convert.keyword.rgb = function (keyword) {
	return cssKeywords[keyword];
};

convert.rgb.xyz = function (rgb) {
	let r = rgb[0] / 255;
	let g = rgb[1] / 255;
	let b = rgb[2] / 255;

	// Assume sRGB
	r = r > 0.04045 ? (((r + 0.055) / 1.055) ** 2.4) : (r / 12.92);
	g = g > 0.04045 ? (((g + 0.055) / 1.055) ** 2.4) : (g / 12.92);
	b = b > 0.04045 ? (((b + 0.055) / 1.055) ** 2.4) : (b / 12.92);

	const x = (r * 0.4124) + (g * 0.3576) + (b * 0.1805);
	const y = (r * 0.2126) + (g * 0.7152) + (b * 0.0722);
	const z = (r * 0.0193) + (g * 0.1192) + (b * 0.9505);

	return [x * 100, y * 100, z * 100];
};

convert.rgb.lab = function (rgb) {
	const xyz = convert.rgb.xyz(rgb);
	let x = xyz[0];
	let y = xyz[1];
	let z = xyz[2];

	x /= 95.047;
	y /= 100;
	z /= 108.883;

	x = x > 0.008856 ? (x ** (1 / 3)) : (7.787 * x) + (16 / 116);
	y = y > 0.008856 ? (y ** (1 / 3)) : (7.787 * y) + (16 / 116);
	z = z > 0.008856 ? (z ** (1 / 3)) : (7.787 * z) + (16 / 116);

	const l = (116 * y) - 16;
	const a = 500 * (x - y);
	const b = 200 * (y - z);

	return [l, a, b];
};

convert.hsl.rgb = function (hsl) {
	const h = hsl[0] / 360;
	const s = hsl[1] / 100;
	const l = hsl[2] / 100;
	let t2;
	let t3;
	let val;

	if (s === 0) {
		val = l * 255;
		return [val, val, val];
	}

	if (l < 0.5) {
		t2 = l * (1 + s);
	} else {
		t2 = l + s - l * s;
	}

	const t1 = 2 * l - t2;

	const rgb = [0, 0, 0];
	for (let i = 0; i < 3; i++) {
		t3 = h + 1 / 3 * -(i - 1);
		if (t3 < 0) {
			t3++;
		}

		if (t3 > 1) {
			t3--;
		}

		if (6 * t3 < 1) {
			val = t1 + (t2 - t1) * 6 * t3;
		} else if (2 * t3 < 1) {
			val = t2;
		} else if (3 * t3 < 2) {
			val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
		} else {
			val = t1;
		}

		rgb[i] = val * 255;
	}

	return rgb;
};

convert.hsl.hsv = function (hsl) {
	const h = hsl[0];
	let s = hsl[1] / 100;
	let l = hsl[2] / 100;
	let smin = s;
	const lmin = Math.max(l, 0.01);

	l *= 2;
	s *= (l <= 1) ? l : 2 - l;
	smin *= lmin <= 1 ? lmin : 2 - lmin;
	const v = (l + s) / 2;
	const sv = l === 0 ? (2 * smin) / (lmin + smin) : (2 * s) / (l + s);

	return [h, sv * 100, v * 100];
};

convert.hsv.rgb = function (hsv) {
	const h = hsv[0] / 60;
	const s = hsv[1] / 100;
	let v = hsv[2] / 100;
	const hi = Math.floor(h) % 6;

	const f = h - Math.floor(h);
	const p = 255 * v * (1 - s);
	const q = 255 * v * (1 - (s * f));
	const t = 255 * v * (1 - (s * (1 - f)));
	v *= 255;

	switch (hi) {
		case 0:
			return [v, t, p];
		case 1:
			return [q, v, p];
		case 2:
			return [p, v, t];
		case 3:
			return [p, q, v];
		case 4:
			return [t, p, v];
		case 5:
			return [v, p, q];
	}
};

convert.hsv.hsl = function (hsv) {
	const h = hsv[0];
	const s = hsv[1] / 100;
	const v = hsv[2] / 100;
	const vmin = Math.max(v, 0.01);
	let sl;
	let l;

	l = (2 - s) * v;
	const lmin = (2 - s) * vmin;
	sl = s * vmin;
	sl /= (lmin <= 1) ? lmin : 2 - lmin;
	sl = sl || 0;
	l /= 2;

	return [h, sl * 100, l * 100];
};

// http://dev.w3.org/csswg/css-color/#hwb-to-rgb
convert.hwb.rgb = function (hwb) {
	const h = hwb[0] / 360;
	let wh = hwb[1] / 100;
	let bl = hwb[2] / 100;
	const ratio = wh + bl;
	let f;

	// Wh + bl cant be > 1
	if (ratio > 1) {
		wh /= ratio;
		bl /= ratio;
	}

	const i = Math.floor(6 * h);
	const v = 1 - bl;
	f = 6 * h - i;

	if ((i & 0x01) !== 0) {
		f = 1 - f;
	}

	const n = wh + f * (v - wh); // Linear interpolation

	let r;
	let g;
	let b;
	/* eslint-disable max-statements-per-line,no-multi-spaces */
	switch (i) {
		default:
		case 6:
		case 0: r = v;  g = n;  b = wh; break;
		case 1: r = n;  g = v;  b = wh; break;
		case 2: r = wh; g = v;  b = n; break;
		case 3: r = wh; g = n;  b = v; break;
		case 4: r = n;  g = wh; b = v; break;
		case 5: r = v;  g = wh; b = n; break;
	}
	/* eslint-enable max-statements-per-line,no-multi-spaces */

	return [r * 255, g * 255, b * 255];
};

convert.cmyk.rgb = function (cmyk) {
	const c = cmyk[0] / 100;
	const m = cmyk[1] / 100;
	const y = cmyk[2] / 100;
	const k = cmyk[3] / 100;

	const r = 1 - Math.min(1, c * (1 - k) + k);
	const g = 1 - Math.min(1, m * (1 - k) + k);
	const b = 1 - Math.min(1, y * (1 - k) + k);

	return [r * 255, g * 255, b * 255];
};

convert.xyz.rgb = function (xyz) {
	const x = xyz[0] / 100;
	const y = xyz[1] / 100;
	const z = xyz[2] / 100;
	let r;
	let g;
	let b;

	r = (x * 3.2406) + (y * -1.5372) + (z * -0.4986);
	g = (x * -0.9689) + (y * 1.8758) + (z * 0.0415);
	b = (x * 0.0557) + (y * -0.2040) + (z * 1.0570);

	// Assume sRGB
	r = r > 0.0031308
		? ((1.055 * (r ** (1.0 / 2.4))) - 0.055)
		: r * 12.92;

	g = g > 0.0031308
		? ((1.055 * (g ** (1.0 / 2.4))) - 0.055)
		: g * 12.92;

	b = b > 0.0031308
		? ((1.055 * (b ** (1.0 / 2.4))) - 0.055)
		: b * 12.92;

	r = Math.min(Math.max(0, r), 1);
	g = Math.min(Math.max(0, g), 1);
	b = Math.min(Math.max(0, b), 1);

	return [r * 255, g * 255, b * 255];
};

convert.xyz.lab = function (xyz) {
	let x = xyz[0];
	let y = xyz[1];
	let z = xyz[2];

	x /= 95.047;
	y /= 100;
	z /= 108.883;

	x = x > 0.008856 ? (x ** (1 / 3)) : (7.787 * x) + (16 / 116);
	y = y > 0.008856 ? (y ** (1 / 3)) : (7.787 * y) + (16 / 116);
	z = z > 0.008856 ? (z ** (1 / 3)) : (7.787 * z) + (16 / 116);

	const l = (116 * y) - 16;
	const a = 500 * (x - y);
	const b = 200 * (y - z);

	return [l, a, b];
};

convert.lab.xyz = function (lab) {
	const l = lab[0];
	const a = lab[1];
	const b = lab[2];
	let x;
	let y;
	let z;

	y = (l + 16) / 116;
	x = a / 500 + y;
	z = y - b / 200;

	const y2 = y ** 3;
	const x2 = x ** 3;
	const z2 = z ** 3;
	y = y2 > 0.008856 ? y2 : (y - 16 / 116) / 7.787;
	x = x2 > 0.008856 ? x2 : (x - 16 / 116) / 7.787;
	z = z2 > 0.008856 ? z2 : (z - 16 / 116) / 7.787;

	x *= 95.047;
	y *= 100;
	z *= 108.883;

	return [x, y, z];
};

convert.lab.lch = function (lab) {
	const l = lab[0];
	const a = lab[1];
	const b = lab[2];
	let h;

	const hr = Math.atan2(b, a);
	h = hr * 360 / 2 / Math.PI;

	if (h < 0) {
		h += 360;
	}

	const c = Math.sqrt(a * a + b * b);

	return [l, c, h];
};

convert.lch.lab = function (lch) {
	const l = lch[0];
	const c = lch[1];
	const h = lch[2];

	const hr = h / 360 * 2 * Math.PI;
	const a = c * Math.cos(hr);
	const b = c * Math.sin(hr);

	return [l, a, b];
};

convert.rgb.ansi16 = function (args, saturation = null) {
	const [r, g, b] = args;
	let value = saturation === null ? convert.rgb.hsv(args)[2] : saturation; // Hsv -> ansi16 optimization

	value = Math.round(value / 50);

	if (value === 0) {
		return 30;
	}

	let ansi = 30
		+ ((Math.round(b / 255) << 2)
		| (Math.round(g / 255) << 1)
		| Math.round(r / 255));

	if (value === 2) {
		ansi += 60;
	}

	return ansi;
};

convert.hsv.ansi16 = function (args) {
	// Optimization here; we already know the value and don't need to get
	// it converted for us.
	return convert.rgb.ansi16(convert.hsv.rgb(args), args[2]);
};

convert.rgb.ansi256 = function (args) {
	const r = args[0];
	const g = args[1];
	const b = args[2];

	// We use the extended greyscale palette here, with the exception of
	// black and white. normal palette only has 4 greyscale shades.
	if (r === g && g === b) {
		if (r < 8) {
			return 16;
		}

		if (r > 248) {
			return 231;
		}

		return Math.round(((r - 8) / 247) * 24) + 232;
	}

	const ansi = 16
		+ (36 * Math.round(r / 255 * 5))
		+ (6 * Math.round(g / 255 * 5))
		+ Math.round(b / 255 * 5);

	return ansi;
};

convert.ansi16.rgb = function (args) {
	let color = args % 10;

	// Handle greyscale
	if (color === 0 || color === 7) {
		if (args > 50) {
			color += 3.5;
		}

		color = color / 10.5 * 255;

		return [color, color, color];
	}

	const mult = (~~(args > 50) + 1) * 0.5;
	const r = ((color & 1) * mult) * 255;
	const g = (((color >> 1) & 1) * mult) * 255;
	const b = (((color >> 2) & 1) * mult) * 255;

	return [r, g, b];
};

convert.ansi256.rgb = function (args) {
	// Handle greyscale
	if (args >= 232) {
		const c = (args - 232) * 10 + 8;
		return [c, c, c];
	}

	args -= 16;

	let rem;
	const r = Math.floor(args / 36) / 5 * 255;
	const g = Math.floor((rem = args % 36) / 6) / 5 * 255;
	const b = (rem % 6) / 5 * 255;

	return [r, g, b];
};

convert.rgb.hex = function (args) {
	const integer = ((Math.round(args[0]) & 0xFF) << 16)
		+ ((Math.round(args[1]) & 0xFF) << 8)
		+ (Math.round(args[2]) & 0xFF);

	const string = integer.toString(16).toUpperCase();
	return '000000'.substring(string.length) + string;
};

convert.hex.rgb = function (args) {
	const match = args.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);
	if (!match) {
		return [0, 0, 0];
	}

	let colorString = match[0];

	if (match[0].length === 3) {
		colorString = colorString.split('').map(char => {
			return char + char;
		}).join('');
	}

	const integer = parseInt(colorString, 16);
	const r = (integer >> 16) & 0xFF;
	const g = (integer >> 8) & 0xFF;
	const b = integer & 0xFF;

	return [r, g, b];
};

convert.rgb.hcg = function (rgb) {
	const r = rgb[0] / 255;
	const g = rgb[1] / 255;
	const b = rgb[2] / 255;
	const max = Math.max(Math.max(r, g), b);
	const min = Math.min(Math.min(r, g), b);
	const chroma = (max - min);
	let grayscale;
	let hue;

	if (chroma < 1) {
		grayscale = min / (1 - chroma);
	} else {
		grayscale = 0;
	}

	if (chroma <= 0) {
		hue = 0;
	} else
	if (max === r) {
		hue = ((g - b) / chroma) % 6;
	} else
	if (max === g) {
		hue = 2 + (b - r) / chroma;
	} else {
		hue = 4 + (r - g) / chroma;
	}

	hue /= 6;
	hue %= 1;

	return [hue * 360, chroma * 100, grayscale * 100];
};

convert.hsl.hcg = function (hsl) {
	const s = hsl[1] / 100;
	const l = hsl[2] / 100;

	const c = l < 0.5 ? (2.0 * s * l) : (2.0 * s * (1.0 - l));

	let f = 0;
	if (c < 1.0) {
		f = (l - 0.5 * c) / (1.0 - c);
	}

	return [hsl[0], c * 100, f * 100];
};

convert.hsv.hcg = function (hsv) {
	const s = hsv[1] / 100;
	const v = hsv[2] / 100;

	const c = s * v;
	let f = 0;

	if (c < 1.0) {
		f = (v - c) / (1 - c);
	}

	return [hsv[0], c * 100, f * 100];
};

convert.hcg.rgb = function (hcg) {
	const h = hcg[0] / 360;
	const c = hcg[1] / 100;
	const g = hcg[2] / 100;

	if (c === 0.0) {
		return [g * 255, g * 255, g * 255];
	}

	const pure = [0, 0, 0];
	const hi = (h % 1) * 6;
	const v = hi % 1;
	const w = 1 - v;
	let mg = 0;

	/* eslint-disable max-statements-per-line */
	switch (Math.floor(hi)) {
		case 0:
			pure[0] = 1; pure[1] = v; pure[2] = 0; break;
		case 1:
			pure[0] = w; pure[1] = 1; pure[2] = 0; break;
		case 2:
			pure[0] = 0; pure[1] = 1; pure[2] = v; break;
		case 3:
			pure[0] = 0; pure[1] = w; pure[2] = 1; break;
		case 4:
			pure[0] = v; pure[1] = 0; pure[2] = 1; break;
		default:
			pure[0] = 1; pure[1] = 0; pure[2] = w;
	}
	/* eslint-enable max-statements-per-line */

	mg = (1.0 - c) * g;

	return [
		(c * pure[0] + mg) * 255,
		(c * pure[1] + mg) * 255,
		(c * pure[2] + mg) * 255
	];
};

convert.hcg.hsv = function (hcg) {
	const c = hcg[1] / 100;
	const g = hcg[2] / 100;

	const v = c + g * (1.0 - c);
	let f = 0;

	if (v > 0.0) {
		f = c / v;
	}

	return [hcg[0], f * 100, v * 100];
};

convert.hcg.hsl = function (hcg) {
	const c = hcg[1] / 100;
	const g = hcg[2] / 100;

	const l = g * (1.0 - c) + 0.5 * c;
	let s = 0;

	if (l > 0.0 && l < 0.5) {
		s = c / (2 * l);
	} else
	if (l >= 0.5 && l < 1.0) {
		s = c / (2 * (1 - l));
	}

	return [hcg[0], s * 100, l * 100];
};

convert.hcg.hwb = function (hcg) {
	const c = hcg[1] / 100;
	const g = hcg[2] / 100;
	const v = c + g * (1.0 - c);
	return [hcg[0], (v - c) * 100, (1 - v) * 100];
};

convert.hwb.hcg = function (hwb) {
	const w = hwb[1] / 100;
	const b = hwb[2] / 100;
	const v = 1 - b;
	const c = v - w;
	let g = 0;

	if (c < 1) {
		g = (v - c) / (1 - c);
	}

	return [hwb[0], c * 100, g * 100];
};

convert.apple.rgb = function (apple) {
	return [(apple[0] / 65535) * 255, (apple[1] / 65535) * 255, (apple[2] / 65535) * 255];
};

convert.rgb.apple = function (rgb) {
	return [(rgb[0] / 255) * 65535, (rgb[1] / 255) * 65535, (rgb[2] / 255) * 65535];
};

convert.gray.rgb = function (args) {
	return [args[0] / 100 * 255, args[0] / 100 * 255, args[0] / 100 * 255];
};

convert.gray.hsl = function (args) {
	return [0, 0, args[0]];
};

convert.gray.hsv = convert.gray.hsl;

convert.gray.hwb = function (gray) {
	return [0, 100, gray[0]];
};

convert.gray.cmyk = function (gray) {
	return [0, 0, 0, gray[0]];
};

convert.gray.lab = function (gray) {
	return [gray[0], 0, 0];
};

convert.gray.hex = function (gray) {
	const val = Math.round(gray[0] / 100 * 255) & 0xFF;
	const integer = (val << 16) + (val << 8) + val;

	const string = integer.toString(16).toUpperCase();
	return '000000'.substring(string.length) + string;
};

convert.rgb.gray = function (rgb) {
	const val = (rgb[0] + rgb[1] + rgb[2]) / 3;
	return [val / 255 * 100];
};


/***/ }),

/***/ "../node_modules/@storybook/components/node_modules/color-convert/index.js":
/*!*********************************************************************************!*\
  !*** ../node_modules/@storybook/components/node_modules/color-convert/index.js ***!
  \*********************************************************************************/
/*! no static exports found */
/*! exports used: default */
/***/ (function(module, exports, __webpack_require__) {

const conversions = __webpack_require__(/*! ./conversions */ "../node_modules/@storybook/components/node_modules/color-convert/conversions.js");
const route = __webpack_require__(/*! ./route */ "../node_modules/@storybook/components/node_modules/color-convert/route.js");

const convert = {};

const models = Object.keys(conversions);

function wrapRaw(fn) {
	const wrappedFn = function (...args) {
		const arg0 = args[0];
		if (arg0 === undefined || arg0 === null) {
			return arg0;
		}

		if (arg0.length > 1) {
			args = arg0;
		}

		return fn(args);
	};

	// Preserve .conversion property if there is one
	if ('conversion' in fn) {
		wrappedFn.conversion = fn.conversion;
	}

	return wrappedFn;
}

function wrapRounded(fn) {
	const wrappedFn = function (...args) {
		const arg0 = args[0];

		if (arg0 === undefined || arg0 === null) {
			return arg0;
		}

		if (arg0.length > 1) {
			args = arg0;
		}

		const result = fn(args);

		// We're assuming the result is an array here.
		// see notice in conversions.js; don't use box types
		// in conversion functions.
		if (typeof result === 'object') {
			for (let len = result.length, i = 0; i < len; i++) {
				result[i] = Math.round(result[i]);
			}
		}

		return result;
	};

	// Preserve .conversion property if there is one
	if ('conversion' in fn) {
		wrappedFn.conversion = fn.conversion;
	}

	return wrappedFn;
}

models.forEach(fromModel => {
	convert[fromModel] = {};

	Object.defineProperty(convert[fromModel], 'channels', {value: conversions[fromModel].channels});
	Object.defineProperty(convert[fromModel], 'labels', {value: conversions[fromModel].labels});

	const routes = route(fromModel);
	const routeModels = Object.keys(routes);

	routeModels.forEach(toModel => {
		const fn = routes[toModel];

		convert[fromModel][toModel] = wrapRounded(fn);
		convert[fromModel][toModel].raw = wrapRaw(fn);
	});
});

module.exports = convert;


/***/ }),

/***/ "../node_modules/@storybook/components/node_modules/color-convert/route.js":
/*!*********************************************************************************!*\
  !*** ../node_modules/@storybook/components/node_modules/color-convert/route.js ***!
  \*********************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

const conversions = __webpack_require__(/*! ./conversions */ "../node_modules/@storybook/components/node_modules/color-convert/conversions.js");

/*
	This function routes a model to all other models.

	all functions that are routed have a property `.conversion` attached
	to the returned synthetic function. This property is an array
	of strings, each with the steps in between the 'from' and 'to'
	color models (inclusive).

	conversions that are not possible simply are not included.
*/

function buildGraph() {
	const graph = {};
	// https://jsperf.com/object-keys-vs-for-in-with-closure/3
	const models = Object.keys(conversions);

	for (let len = models.length, i = 0; i < len; i++) {
		graph[models[i]] = {
			// http://jsperf.com/1-vs-infinity
			// micro-opt, but this is simple.
			distance: -1,
			parent: null
		};
	}

	return graph;
}

// https://en.wikipedia.org/wiki/Breadth-first_search
function deriveBFS(fromModel) {
	const graph = buildGraph();
	const queue = [fromModel]; // Unshift -> queue -> pop

	graph[fromModel].distance = 0;

	while (queue.length) {
		const current = queue.pop();
		const adjacents = Object.keys(conversions[current]);

		for (let len = adjacents.length, i = 0; i < len; i++) {
			const adjacent = adjacents[i];
			const node = graph[adjacent];

			if (node.distance === -1) {
				node.distance = graph[current].distance + 1;
				node.parent = current;
				queue.unshift(adjacent);
			}
		}
	}

	return graph;
}

function link(from, to) {
	return function (args) {
		return to(from(args));
	};
}

function wrapConversion(toModel, graph) {
	const path = [graph[toModel].parent, toModel];
	let fn = conversions[graph[toModel].parent][toModel];

	let cur = graph[toModel].parent;
	while (graph[cur].parent) {
		path.unshift(graph[cur].parent);
		fn = link(conversions[graph[cur].parent][cur], fn);
		cur = graph[cur].parent;
	}

	fn.conversion = path;
	return fn;
}

module.exports = function (fromModel) {
	const graph = deriveBFS(fromModel);
	const conversion = {};

	const models = Object.keys(graph);
	for (let len = models.length, i = 0; i < len; i++) {
		const toModel = models[i];
		const node = graph[toModel];

		if (node.parent === null) {
			// No possible conversion, or this node is the source model.
			continue;
		}

		conversion[toModel] = wrapConversion(toModel, graph);
	}

	return conversion;
};



/***/ }),

/***/ "../node_modules/color-name/index.js":
/*!*******************************************!*\
  !*** ../node_modules/color-name/index.js ***!
  \*******************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = {
	"aliceblue": [240, 248, 255],
	"antiquewhite": [250, 235, 215],
	"aqua": [0, 255, 255],
	"aquamarine": [127, 255, 212],
	"azure": [240, 255, 255],
	"beige": [245, 245, 220],
	"bisque": [255, 228, 196],
	"black": [0, 0, 0],
	"blanchedalmond": [255, 235, 205],
	"blue": [0, 0, 255],
	"blueviolet": [138, 43, 226],
	"brown": [165, 42, 42],
	"burlywood": [222, 184, 135],
	"cadetblue": [95, 158, 160],
	"chartreuse": [127, 255, 0],
	"chocolate": [210, 105, 30],
	"coral": [255, 127, 80],
	"cornflowerblue": [100, 149, 237],
	"cornsilk": [255, 248, 220],
	"crimson": [220, 20, 60],
	"cyan": [0, 255, 255],
	"darkblue": [0, 0, 139],
	"darkcyan": [0, 139, 139],
	"darkgoldenrod": [184, 134, 11],
	"darkgray": [169, 169, 169],
	"darkgreen": [0, 100, 0],
	"darkgrey": [169, 169, 169],
	"darkkhaki": [189, 183, 107],
	"darkmagenta": [139, 0, 139],
	"darkolivegreen": [85, 107, 47],
	"darkorange": [255, 140, 0],
	"darkorchid": [153, 50, 204],
	"darkred": [139, 0, 0],
	"darksalmon": [233, 150, 122],
	"darkseagreen": [143, 188, 143],
	"darkslateblue": [72, 61, 139],
	"darkslategray": [47, 79, 79],
	"darkslategrey": [47, 79, 79],
	"darkturquoise": [0, 206, 209],
	"darkviolet": [148, 0, 211],
	"deeppink": [255, 20, 147],
	"deepskyblue": [0, 191, 255],
	"dimgray": [105, 105, 105],
	"dimgrey": [105, 105, 105],
	"dodgerblue": [30, 144, 255],
	"firebrick": [178, 34, 34],
	"floralwhite": [255, 250, 240],
	"forestgreen": [34, 139, 34],
	"fuchsia": [255, 0, 255],
	"gainsboro": [220, 220, 220],
	"ghostwhite": [248, 248, 255],
	"gold": [255, 215, 0],
	"goldenrod": [218, 165, 32],
	"gray": [128, 128, 128],
	"green": [0, 128, 0],
	"greenyellow": [173, 255, 47],
	"grey": [128, 128, 128],
	"honeydew": [240, 255, 240],
	"hotpink": [255, 105, 180],
	"indianred": [205, 92, 92],
	"indigo": [75, 0, 130],
	"ivory": [255, 255, 240],
	"khaki": [240, 230, 140],
	"lavender": [230, 230, 250],
	"lavenderblush": [255, 240, 245],
	"lawngreen": [124, 252, 0],
	"lemonchiffon": [255, 250, 205],
	"lightblue": [173, 216, 230],
	"lightcoral": [240, 128, 128],
	"lightcyan": [224, 255, 255],
	"lightgoldenrodyellow": [250, 250, 210],
	"lightgray": [211, 211, 211],
	"lightgreen": [144, 238, 144],
	"lightgrey": [211, 211, 211],
	"lightpink": [255, 182, 193],
	"lightsalmon": [255, 160, 122],
	"lightseagreen": [32, 178, 170],
	"lightskyblue": [135, 206, 250],
	"lightslategray": [119, 136, 153],
	"lightslategrey": [119, 136, 153],
	"lightsteelblue": [176, 196, 222],
	"lightyellow": [255, 255, 224],
	"lime": [0, 255, 0],
	"limegreen": [50, 205, 50],
	"linen": [250, 240, 230],
	"magenta": [255, 0, 255],
	"maroon": [128, 0, 0],
	"mediumaquamarine": [102, 205, 170],
	"mediumblue": [0, 0, 205],
	"mediumorchid": [186, 85, 211],
	"mediumpurple": [147, 112, 219],
	"mediumseagreen": [60, 179, 113],
	"mediumslateblue": [123, 104, 238],
	"mediumspringgreen": [0, 250, 154],
	"mediumturquoise": [72, 209, 204],
	"mediumvioletred": [199, 21, 133],
	"midnightblue": [25, 25, 112],
	"mintcream": [245, 255, 250],
	"mistyrose": [255, 228, 225],
	"moccasin": [255, 228, 181],
	"navajowhite": [255, 222, 173],
	"navy": [0, 0, 128],
	"oldlace": [253, 245, 230],
	"olive": [128, 128, 0],
	"olivedrab": [107, 142, 35],
	"orange": [255, 165, 0],
	"orangered": [255, 69, 0],
	"orchid": [218, 112, 214],
	"palegoldenrod": [238, 232, 170],
	"palegreen": [152, 251, 152],
	"paleturquoise": [175, 238, 238],
	"palevioletred": [219, 112, 147],
	"papayawhip": [255, 239, 213],
	"peachpuff": [255, 218, 185],
	"peru": [205, 133, 63],
	"pink": [255, 192, 203],
	"plum": [221, 160, 221],
	"powderblue": [176, 224, 230],
	"purple": [128, 0, 128],
	"rebeccapurple": [102, 51, 153],
	"red": [255, 0, 0],
	"rosybrown": [188, 143, 143],
	"royalblue": [65, 105, 225],
	"saddlebrown": [139, 69, 19],
	"salmon": [250, 128, 114],
	"sandybrown": [244, 164, 96],
	"seagreen": [46, 139, 87],
	"seashell": [255, 245, 238],
	"sienna": [160, 82, 45],
	"silver": [192, 192, 192],
	"skyblue": [135, 206, 235],
	"slateblue": [106, 90, 205],
	"slategray": [112, 128, 144],
	"slategrey": [112, 128, 144],
	"snow": [255, 250, 250],
	"springgreen": [0, 255, 127],
	"steelblue": [70, 130, 180],
	"tan": [210, 180, 140],
	"teal": [0, 128, 128],
	"thistle": [216, 191, 216],
	"tomato": [255, 99, 71],
	"turquoise": [64, 224, 208],
	"violet": [238, 130, 238],
	"wheat": [245, 222, 179],
	"white": [255, 255, 255],
	"whitesmoke": [245, 245, 245],
	"yellow": [255, 255, 0],
	"yellowgreen": [154, 205, 50]
};


/***/ }),

/***/ "../node_modules/lodash/throttle.js":
/*!******************************************!*\
  !*** ../node_modules/lodash/throttle.js ***!
  \******************************************/
/*! no static exports found */
/*! exports used: default */
/***/ (function(module, exports, __webpack_require__) {

var debounce = __webpack_require__(/*! ./debounce */ "../node_modules/lodash/debounce.js"),
    isObject = __webpack_require__(/*! ./isObject */ "../node_modules/lodash/isObject.js");

/** Error message constants. */
var FUNC_ERROR_TEXT = 'Expected a function';

/**
 * Creates a throttled function that only invokes `func` at most once per
 * every `wait` milliseconds. The throttled function comes with a `cancel`
 * method to cancel delayed `func` invocations and a `flush` method to
 * immediately invoke them. Provide `options` to indicate whether `func`
 * should be invoked on the leading and/or trailing edge of the `wait`
 * timeout. The `func` is invoked with the last arguments provided to the
 * throttled function. Subsequent calls to the throttled function return the
 * result of the last `func` invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the throttled function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.throttle` and `_.debounce`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to throttle.
 * @param {number} [wait=0] The number of milliseconds to throttle invocations to.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=true]
 *  Specify invoking on the leading edge of the timeout.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new throttled function.
 * @example
 *
 * // Avoid excessively updating the position while scrolling.
 * jQuery(window).on('scroll', _.throttle(updatePosition, 100));
 *
 * // Invoke `renewToken` when the click event is fired, but not more than once every 5 minutes.
 * var throttled = _.throttle(renewToken, 300000, { 'trailing': false });
 * jQuery(element).on('click', throttled);
 *
 * // Cancel the trailing throttled invocation.
 * jQuery(window).on('popstate', throttled.cancel);
 */
function throttle(func, wait, options) {
  var leading = true,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  if (isObject(options)) {
    leading = 'leading' in options ? !!options.leading : leading;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }
  return debounce(func, wait, {
    'leading': leading,
    'maxWait': wait,
    'trailing': trailing
  });
}

module.exports = throttle;


/***/ }),

/***/ "../node_modules/react-colorful/dist/index.module.js":
/*!***********************************************************!*\
  !*** ../node_modules/react-colorful/dist/index.module.js ***!
  \***********************************************************/
/*! exports provided: HexColorInput, HexColorPicker, HslColorPicker, HslStringColorPicker, HslaColorPicker, HslaStringColorPicker, HsvColorPicker, HsvStringColorPicker, HsvaColorPicker, HsvaStringColorPicker, RgbColorPicker, RgbStringColorPicker, RgbaColorPicker, RgbaStringColorPicker, setNonce */
/*! exports used: HexColorPicker, HslaStringColorPicker, RgbaStringColorPicker */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export HexColorInput */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return G; });
/* unused harmony export HslColorPicker */
/* unused harmony export HslStringColorPicker */
/* unused harmony export HslaColorPicker */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return Z; });
/* unused harmony export HsvColorPicker */
/* unused harmony export HsvStringColorPicker */
/* unused harmony export HsvaColorPicker */
/* unused harmony export HsvaStringColorPicker */
/* unused harmony export RgbColorPicker */
/* unused harmony export RgbStringColorPicker */
/* unused harmony export RgbaColorPicker */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return me; });
/* unused harmony export setNonce */
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "../node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
function l(){return(l=Object.assign||function(e){for(var r=1;r<arguments.length;r++){var t=arguments[r];for(var o in t)Object.prototype.hasOwnProperty.call(t,o)&&(e[o]=t[o])}return e}).apply(this,arguments)}function u(e,r){if(null==e)return{};var t,o,n={},a=Object.keys(e);for(o=0;o<a.length;o++)r.indexOf(t=a[o])>=0||(n[t]=e[t]);return n}var c="undefined"!=typeof window?react__WEBPACK_IMPORTED_MODULE_0__["useLayoutEffect"]:react__WEBPACK_IMPORTED_MODULE_0__["useEffect"];function i(e){var r=Object(react__WEBPACK_IMPORTED_MODULE_0__["useRef"])(e);return Object(react__WEBPACK_IMPORTED_MODULE_0__["useEffect"])(function(){r.current=e}),Object(react__WEBPACK_IMPORTED_MODULE_0__["useCallback"])(function(e){return r.current&&r.current(e)},[])}var s,f=function(e,r,t){return void 0===r&&(r=0),void 0===t&&(t=1),e>t?t:e<r?r:e},v=function(e){return"touches"in e},d=function(e,r){var t=e.getBoundingClientRect(),o=v(r)?r.touches[0]:r;return{left:f((o.pageX-(t.left+window.pageXOffset))/t.width),top:f((o.pageY-(t.top+window.pageYOffset))/t.height)}},h=function(e){!v(e)&&e.preventDefault()},m=react__WEBPACK_IMPORTED_MODULE_0___default.a.memo(function(r){var t=r.onMove,s=r.onKey,f=u(r,["onMove","onKey"]),m=Object(react__WEBPACK_IMPORTED_MODULE_0__["useRef"])(null),g=Object(react__WEBPACK_IMPORTED_MODULE_0__["useRef"])(!1),p=Object(react__WEBPACK_IMPORTED_MODULE_0__["useState"])(!1),b=p[0],_=p[1],C=i(t),x=i(s),E=Object(react__WEBPACK_IMPORTED_MODULE_0__["useCallback"])(function(e){h(e),(v(e)?e.touches.length>0:e.buttons>0)&&m.current?C(d(m.current,e)):_(!1)},[C]),H=Object(react__WEBPACK_IMPORTED_MODULE_0__["useCallback"])(function(e){var r,t=e.nativeEvent,o=m.current;h(t),r=t,g.current&&!v(r)||(g.current||(g.current=v(r)),0)||!o||(o.focus(),C(d(o,t)),_(!0))},[C]),M=Object(react__WEBPACK_IMPORTED_MODULE_0__["useCallback"])(function(e){var r=e.which||e.keyCode;r<37||r>40||(e.preventDefault(),x({left:39===r?.05:37===r?-.05:0,top:40===r?.05:38===r?-.05:0}))},[x]),N=Object(react__WEBPACK_IMPORTED_MODULE_0__["useCallback"])(function(){return _(!1)},[]),w=Object(react__WEBPACK_IMPORTED_MODULE_0__["useCallback"])(function(e){var r=e?window.addEventListener:window.removeEventListener;r(g.current?"touchmove":"mousemove",E),r(g.current?"touchend":"mouseup",N)},[E,N]);return c(function(){return w(b),function(){b&&w(!1)}},[b,w]),react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div",l({},f,{className:"react-colorful__interactive",ref:m,onTouchStart:H,onMouseDown:H,onKeyDown:M,tabIndex:0,role:"slider"}))}),g=function(e){return e.filter(Boolean).join(" ")},p=function(r){var t=r.color,o=r.left,n=r.top,a=void 0===n?.5:n,l=g(["react-colorful__pointer",r.className]);return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div",{className:l,style:{top:100*a+"%",left:100*o+"%"}},react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div",{className:"react-colorful__pointer-fill",style:{backgroundColor:t}}))},b=function(e,r,t){return void 0===r&&(r=0),void 0===t&&(t=Math.pow(10,r)),Math.round(t*e)/t},_={grad:.9,turn:360,rad:360/(2*Math.PI)},C=function(e){return"#"===e[0]&&(e=e.substr(1)),e.length<6?{r:parseInt(e[0]+e[0],16),g:parseInt(e[1]+e[1],16),b:parseInt(e[2]+e[2],16),a:1}:{r:parseInt(e.substr(0,2),16),g:parseInt(e.substr(2,2),16),b:parseInt(e.substr(4,2),16),a:1}},x=function(e,r){return void 0===r&&(r="deg"),Number(e)*(_[r]||1)},E=function(e){var r=/hsla?\(?\s*(-?\d*\.?\d+)(deg|rad|grad|turn)?[,\s]+(-?\d*\.?\d+)%?[,\s]+(-?\d*\.?\d+)%?,?\s*[/\s]*(-?\d*\.?\d+)?(%)?\s*\)?/i.exec(e);return r?M({h:x(r[1],r[2]),s:Number(r[3]),l:Number(r[4]),a:void 0===r[5]?1:Number(r[5])/(r[6]?100:1)}):{h:0,s:0,v:0,a:1}},H=E,M=function(e){var r=e.s,t=e.l;return{h:e.h,s:(r*=(t<50?t:100-t)/100)>0?2*r/(t+r)*100:0,v:t+r,a:e.a}},N=function(e){var r=e.s,t=e.v,o=e.a,n=(200-r)*t/100;return{h:b(e.h),s:b(n>0&&n<200?r*t/100/(n<=100?n:200-n)*100:0),l:b(n/2),a:b(o,2)}},w=function(e){var r=N(e);return"hsl("+r.h+", "+r.s+"%, "+r.l+"%)"},y=function(e){var r=N(e);return"hsla("+r.h+", "+r.s+"%, "+r.l+"%, "+r.a+")"},q=function(e){var r=e.h,t=e.s,o=e.v,n=e.a;r=r/360*6,t/=100,o/=100;var a=Math.floor(r),l=o*(1-t),u=o*(1-(r-a)*t),c=o*(1-(1-r+a)*t),i=a%6;return{r:b(255*[o,u,l,l,c,o][i]),g:b(255*[c,o,o,u,l,l][i]),b:b(255*[l,l,c,o,o,u][i]),a:b(n,2)}},k=function(e){var r=/hsva?\(?\s*(-?\d*\.?\d+)(deg|rad|grad|turn)?[,\s]+(-?\d*\.?\d+)%?[,\s]+(-?\d*\.?\d+)%?,?\s*[/\s]*(-?\d*\.?\d+)?(%)?\s*\)?/i.exec(e);return r?K({h:x(r[1],r[2]),s:Number(r[3]),v:Number(r[4]),a:void 0===r[5]?1:Number(r[5])/(r[6]?100:1)}):{h:0,s:0,v:0,a:1}},O=k,I=function(e){var r=/rgba?\(?\s*(-?\d*\.?\d+)(%)?[,\s]+(-?\d*\.?\d+)(%)?[,\s]+(-?\d*\.?\d+)(%)?,?\s*[/\s]*(-?\d*\.?\d+)?(%)?\s*\)?/i.exec(e);return r?B({r:Number(r[1])/(r[2]?100/255:1),g:Number(r[3])/(r[4]?100/255:1),b:Number(r[5])/(r[6]?100/255:1),a:void 0===r[7]?1:Number(r[7])/(r[8]?100:1)}):{h:0,s:0,v:0,a:1}},j=I,z=function(e){var r=e.toString(16);return r.length<2?"0"+r:r},B=function(e){var r=e.r,t=e.g,o=e.b,n=e.a,a=Math.max(r,t,o),l=a-Math.min(r,t,o),u=l?a===r?(t-o)/l:a===t?2+(o-r)/l:4+(r-t)/l:0;return{h:b(60*(u<0?u+6:u)),s:b(a?l/a*100:0),v:b(a/255*100),a:n}},K=function(e){return{h:b(e.h),s:b(e.s),v:b(e.v),a:b(e.a,2)}},A=react__WEBPACK_IMPORTED_MODULE_0___default.a.memo(function(r){var t=r.hue,o=r.onChange,n=g(["react-colorful__hue",r.className]);return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div",{className:n},react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(m,{onMove:function(e){o({h:360*e.left})},onKey:function(e){o({h:f(t+360*e.left,0,360)})},"aria-label":"Hue","aria-valuetext":b(t)},react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(p,{className:"react-colorful__hue-pointer",left:t/360,color:w({h:t,s:100,v:100,a:1})})))}),L=react__WEBPACK_IMPORTED_MODULE_0___default.a.memo(function(r){var t=r.hsva,o=r.onChange,n={backgroundColor:w({h:t.h,s:100,v:100,a:1})};return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div",{className:"react-colorful__saturation",style:n},react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(m,{onMove:function(e){o({s:100*e.left,v:100-100*e.top})},onKey:function(e){o({s:f(t.s+100*e.left,0,100),v:f(t.v-100*e.top,0,100)})},"aria-label":"Color","aria-valuetext":"Saturation "+b(t.s)+"%, Brightness "+b(t.v)+"%"},react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(p,{className:"react-colorful__saturation-pointer",top:1-t.v/100,left:t.s/100,color:w(t)})))}),D=function(e,r){if(e===r)return!0;for(var t in e)if(e[t]!==r[t])return!1;return!0},F=function(e,r){return e.replace(/\s/g,"")===r.replace(/\s/g,"")};function S(e,r,l){var u=i(l),c=Object(react__WEBPACK_IMPORTED_MODULE_0__["useState"])(function(){return e.toHsva(r)}),s=c[0],f=c[1],v=Object(react__WEBPACK_IMPORTED_MODULE_0__["useRef"])({color:r,hsva:s});Object(react__WEBPACK_IMPORTED_MODULE_0__["useEffect"])(function(){if(!e.equal(r,v.current.color)){var t=e.toHsva(r);v.current={hsva:t,color:r},f(t)}},[r,e]),Object(react__WEBPACK_IMPORTED_MODULE_0__["useEffect"])(function(){var r;D(s,v.current.hsva)||e.equal(r=e.fromHsva(s),v.current.color)||(v.current={hsva:s,color:r},u(r))},[s,e,u]);var d=Object(react__WEBPACK_IMPORTED_MODULE_0__["useCallback"])(function(e){f(function(r){return Object.assign({},r,e)})},[]);return[s,d]}var P,T=function(){return s||( true?__webpack_require__.nc:undefined)},X=function(e){s=e},Y=function(){c(function(){if("undefined"!=typeof document&&!P){(P=document.createElement("style")).innerHTML='.react-colorful{position:relative;display:flex;flex-direction:column;width:200px;height:200px;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;cursor:default}.react-colorful__saturation{position:relative;flex-grow:1;border-color:transparent;border-bottom:12px solid #000;border-radius:8px 8px 0 0;background-image:linear-gradient(0deg,#000,transparent),linear-gradient(90deg,#fff,hsla(0,0%,100%,0))}.react-colorful__alpha-gradient,.react-colorful__pointer-fill{content:"";position:absolute;left:0;top:0;right:0;bottom:0;pointer-events:none;border-radius:inherit}.react-colorful__alpha-gradient,.react-colorful__saturation{box-shadow:inset 0 0 0 1px rgba(0,0,0,.05)}.react-colorful__alpha,.react-colorful__hue{position:relative;height:24px}.react-colorful__hue{background:linear-gradient(90deg,red 0,#ff0 17%,#0f0 33%,#0ff 50%,#00f 67%,#f0f 83%,red)}.react-colorful__last-control{border-radius:0 0 8px 8px}.react-colorful__interactive{position:absolute;left:0;top:0;right:0;bottom:0;border-radius:inherit;outline:none;touch-action:none}.react-colorful__pointer{position:absolute;z-index:1;box-sizing:border-box;width:28px;height:28px;transform:translate(-50%,-50%);background-color:#fff;border:2px solid #fff;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,.2)}.react-colorful__interactive:focus .react-colorful__pointer{transform:translate(-50%,-50%) scale(1.1)}.react-colorful__alpha,.react-colorful__alpha-pointer{background-color:#fff;background-image:url(\'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill-opacity=".05"><path d="M8 0h8v8H8zM0 8h8v8H0z"/></svg>\')}.react-colorful__saturation-pointer{z-index:3}.react-colorful__hue-pointer{z-index:2}';var e=T();e&&P.setAttribute("nonce",e),document.head.appendChild(P)}},[])},$=function(r){var t=r.className,o=r.colorModel,n=r.color,a=void 0===n?o.defaultColor:n,c=r.onChange,i=u(r,["className","colorModel","color","onChange"]);Y();var s=S(o,a,c),f=s[0],v=s[1],d=g(["react-colorful",t]);return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div",l({},i,{className:d}),react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(L,{hsva:f,onChange:v}),react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(A,{hue:f.h,onChange:v,className:"react-colorful__last-control"}))},R={defaultColor:"000",toHsva:function(e){return B(C(e))},fromHsva:function(e){return t=(r=q(e)).g,o=r.b,"#"+z(r.r)+z(t)+z(o);var r,t,o},equal:function(e,r){return e.toLowerCase()===r.toLowerCase()||D(C(e),C(r))}},G=function(r){return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement($,l({},r,{colorModel:R}))},J=function(r){var t=r.className,o=r.hsva,n=r.onChange,a={backgroundImage:"linear-gradient(90deg, "+y(Object.assign({},o,{a:0}))+", "+y(Object.assign({},o,{a:1}))+")"},l=g(["react-colorful__alpha",t]);return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div",{className:l},react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div",{className:"react-colorful__alpha-gradient",style:a}),react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(m,{onMove:function(e){n({a:e.left})},onKey:function(e){n({a:f(o.a+e.left)})},"aria-label":"Alpha","aria-valuetext":b(100*o.a)+"%"},react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(p,{className:"react-colorful__alpha-pointer",left:o.a,color:y(o)})))},Q=function(r){var t=r.className,o=r.colorModel,n=r.color,a=void 0===n?o.defaultColor:n,c=r.onChange,i=u(r,["className","colorModel","color","onChange"]);Y();var s=S(o,a,c),f=s[0],v=s[1],d=g(["react-colorful",t]);return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div",l({},i,{className:d}),react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(L,{hsva:f,onChange:v}),react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(A,{hue:f.h,onChange:v}),react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(J,{hsva:f,onChange:v,className:"react-colorful__last-control"}))},U={defaultColor:{h:0,s:0,l:0,a:1},toHsva:M,fromHsva:N,equal:D},V=function(r){return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(Q,l({},r,{colorModel:U}))},W={defaultColor:"hsla(0, 0%, 0%, 1)",toHsva:E,fromHsva:y,equal:F},Z=function(r){return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(Q,l({},r,{colorModel:W}))},ee={defaultColor:{h:0,s:0,l:0},toHsva:function(e){return M({h:e.h,s:e.s,l:e.l,a:1})},fromHsva:function(e){return{h:(r=N(e)).h,s:r.s,l:r.l};var r},equal:D},re=function(r){return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement($,l({},r,{colorModel:ee}))},te={defaultColor:"hsl(0, 0%, 0%)",toHsva:H,fromHsva:w,equal:F},oe=function(r){return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement($,l({},r,{colorModel:te}))},ne={defaultColor:{h:0,s:0,v:0,a:1},toHsva:function(e){return e},fromHsva:K,equal:D},ae=function(r){return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(Q,l({},r,{colorModel:ne}))},le={defaultColor:"hsva(0, 0%, 0%, 1)",toHsva:k,fromHsva:function(e){var r=K(e);return"hsva("+r.h+", "+r.s+"%, "+r.v+"%, "+r.a+")"},equal:F},ue=function(r){return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(Q,l({},r,{colorModel:le}))},ce={defaultColor:{h:0,s:0,v:0},toHsva:function(e){return{h:e.h,s:e.s,v:e.v,a:1}},fromHsva:function(e){var r=K(e);return{h:r.h,s:r.s,v:r.v}},equal:D},ie=function(r){return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement($,l({},r,{colorModel:ce}))},se={defaultColor:"hsv(0, 0%, 0%)",toHsva:O,fromHsva:function(e){var r=K(e);return"hsv("+r.h+", "+r.s+"%, "+r.v+"%)"},equal:F},fe=function(r){return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement($,l({},r,{colorModel:se}))},ve={defaultColor:{r:0,g:0,b:0,a:1},toHsva:B,fromHsva:q,equal:D},de=function(r){return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(Q,l({},r,{colorModel:ve}))},he={defaultColor:"rgba(0, 0, 0, 1)",toHsva:I,fromHsva:function(e){var r=q(e);return"rgba("+r.r+", "+r.g+", "+r.b+", "+r.a+")"},equal:F},me=function(r){return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(Q,l({},r,{colorModel:he}))},ge={defaultColor:{r:0,g:0,b:0},toHsva:function(e){return B({r:e.r,g:e.g,b:e.b,a:1})},fromHsva:function(e){return{r:(r=q(e)).r,g:r.g,b:r.b};var r},equal:D},pe=function(r){return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement($,l({},r,{colorModel:ge}))},be={defaultColor:"rgb(0, 0, 0)",toHsva:j,fromHsva:function(e){var r=q(e);return"rgb("+r.r+", "+r.g+", "+r.b+")"},equal:F},_e=function(r){return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement($,l({},r,{colorModel:be}))},Ce=/^#?[0-9A-F]{3}$/i,xe=/^#?[0-9A-F]{6}$/i,Ee=function(e){return xe.test(e)||Ce.test(e)},He=function(e){return e.replace(/([^0-9A-F]+)/gi,"").substr(0,6)},Me=function(r){var n=r.color,c=void 0===n?"":n,s=r.onChange,f=r.onBlur,v=r.prefixed,d=u(r,["color","onChange","onBlur","prefixed"]),h=Object(react__WEBPACK_IMPORTED_MODULE_0__["useState"])(function(){return He(c)}),m=h[0],g=h[1],p=i(s),b=i(f),_=Object(react__WEBPACK_IMPORTED_MODULE_0__["useCallback"])(function(e){var r=He(e.target.value);g(r),Ee(r)&&p("#"+r)},[p]),C=Object(react__WEBPACK_IMPORTED_MODULE_0__["useCallback"])(function(e){Ee(e.target.value)||g(He(c)),b(e)},[c,b]);return Object(react__WEBPACK_IMPORTED_MODULE_0__["useEffect"])(function(){g(He(c))},[c]),react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("input",l({},d,{value:(v?"#":"")+m,spellCheck:"false",onChange:_,onBlur:C}))};
//# sourceMappingURL=index.module.js.map


/***/ })

}]);
//# sourceMappingURL=2.dd13c266.iframe.bundle.js.map
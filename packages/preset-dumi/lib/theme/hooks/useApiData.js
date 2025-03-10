"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _react() {
  const data = require("react");

  _react = function _react() {
    return data;
  };

  return data;
}

function _apis() {
  const data = _interopRequireDefault(require("@@/dumi/apis"));

  _apis = function _apis() {
    return data;
  };

  return data;
}

var _context = _interopRequireDefault(require("../context"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

/**
 * get API data
 * @param identifier      component name
 * @param locale          current locale
 * @param isDefaultLocale default locale flag
 */
function getApiData(identifier, locale, isDefaultLocale) {
  return Object.entries(_apis().default[identifier]).reduce((expts, [expt, rows]) => {
    expts[expt] = rows.map(props => {
      // copy original data
      const result = Object.assign({}, props);
      Object.keys(props).forEach(prop => {
        // discard useless locale property
        if (/^description(\.|$)/.test(prop)) {
          const _prop$match = prop.match(/^description\.?(.*)$/),
                _prop$match2 = _slicedToArray(_prop$match, 2),
                propLocale = _prop$match2[1];

          if (propLocale && propLocale !== locale || !propLocale && !isDefaultLocale) {
            delete result[prop];
          } else {
            result.description = result[prop];
          }
        }
      });
      return result;
    });
    return expts;
  }, {});
}
/**
 * use api data by identifier
 * @note  identifier is component name or component path
 */


var _default = identifier => {
  const _useContext = (0, _react().useContext)(_context.default),
        locale = _useContext.locale,
        locales = _useContext.config.locales;

  const isDefaultLocale = !locales.length || locales[0].name === locale;

  const _useState = (0, _react().useState)(getApiData(identifier, locale, isDefaultLocale)),
        _useState2 = _slicedToArray(_useState, 2),
        data = _useState2[0],
        setData = _useState2[1];

  (0, _react().useEffect)(() => {
    setData(getApiData(identifier, locale, isDefaultLocale));
  }, [identifier, locale, isDefaultLocale]);
  return data;
};

exports.default = _default;
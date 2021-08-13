"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = code;

function _hastUtilIsElement() {
  const data = _interopRequireDefault(require("hast-util-is-element"));

  _hastUtilIsElement = function _hastUtilIsElement() {
    return data;
  };

  return data;
}

function _hastUtilHasProperty() {
  const data = _interopRequireDefault(require("hast-util-has-property"));

  _hastUtilHasProperty = function _hastUtilHasProperty() {
    return data;
  };

  return data;
}

function _unistUtilVisit() {
  const data = _interopRequireDefault(require("unist-util-visit"));

  _unistUtilVisit = function _unistUtilVisit() {
    return data;
  };

  return data;
}

var _utils = require("./utils");

var _moduleResolver = require("../../utils/moduleResolver");

const _excluded = ["src"];

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

/**
 * remark plugin for parse code tag to external demo
 */
function code() {
  return ast => {
    (0, _unistUtilVisit().default)(ast, 'element', (node, index, parent) => {
      if ((0, _hastUtilIsElement().default)(node, 'code') && (0, _hastUtilHasProperty().default)(node, 'src')) {
        const _node$properties = node.properties,
              src = _node$properties.src,
              attrs = _objectWithoutProperties(_node$properties, _excluded);

        const absPath = (0, _moduleResolver.getModuleResolvePath)({
          basePath: this.data('fileAbsPath'),
          sourcePath: src,
          extensions: ['.tsx', '.jsx']
        });
        const parsedAttrs = (0, _utils.parseElmAttrToProps)(attrs); // replace original node

        parent.children.splice(index, 1, {
          type: 'element',
          tagName: 'div',
          position: node.position,
          properties: {
            type: 'previewer',
            filePath: absPath,
            meta: _objectSpread({}, parsedAttrs)
          }
        });
      }
    });
  };
}
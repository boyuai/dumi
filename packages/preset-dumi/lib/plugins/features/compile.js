"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _path() {
  const data = _interopRequireDefault(require("path"));

  _path = function _path() {
    return data;
  };

  return data;
}

var _context = _interopRequireDefault(require("../../context"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * plugin for compile markdown files
 */
var _default = api => {
  // exclude .md file for url-loader
  api.modifyDefaultConfig(config => _objectSpread(_objectSpread({}, config), {}, {
    urlLoaderExcludes: [/\.md$/]
  })); // configure loader for .md file

  api.chainWebpack(config => {
    var _oPlainTextTest$sourc;

    const oPlainTextTest = config.module.rule('plaintext').get('test');
    const babelLoader = config.module.rule('js').use('babel-loader').entries(); // remove md file test from umi

    if (oPlainTextTest === null || oPlainTextTest === void 0 ? void 0 : (_oPlainTextTest$sourc = oPlainTextTest.source) === null || _oPlainTextTest$sourc === void 0 ? void 0 : _oPlainTextTest$sourc.includes('md')) {
      config.module.rule('plaintext').set('test', new RegExp(oPlainTextTest.source.replace(/\|md|md\|/, ''), oPlainTextTest.flags));
    } // add md file loader


    config.module.rule('dumi').test(/\.md$/).use('babel-loader').loader(babelLoader.loader).options(babelLoader.options).end().use('dumi-loader').loader(require.resolve('../../loader')).options({
      previewLangs: _context.default.opts.resolve.previewLangs,
      passivePreview: _context.default.opts.resolve.passivePreview
    }); // set asset type to javascript/auto to skip webpack internal json loader
    // refer: https://webpack.js.org/guides/asset-modules/

    config.module.rule('dumi-raw-code') // only apply for inline way with query
    .resourceQuery(/dumi\-raw\-code/).type('javascript/auto').use('dumi-raw-code-loader').loader(require.resolve('../../loader/rawCode')); // add raw code loader (like raw-loader but without frontmatter)

    config.resolveLoader.alias.set('dumi-raw-code-loader', `${require.resolve('../../loader/rawCode')}`);
    return config;
  }); // watch .md files

  api.addTmpGenerateWatcherPaths(() => [..._context.default.opts.resolve.includes.map(key => _path().default.join(api.paths.cwd, key, '**/*.md')), ..._context.default.opts.resolve.examples.map(key => _path().default.join(api.paths.cwd, key, '*.{tsx,jsx}'))]);
};

exports.default = _default;
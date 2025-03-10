"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = meta;

function _fs() {
  const data = _interopRequireDefault(require("fs"));

  _fs = function _fs() {
    return data;
  };

  return data;
}

function _path() {
  const data = _interopRequireDefault(require("path"));

  _path = function _path() {
    return data;
  };

  return data;
}

function _slash() {
  const data = _interopRequireDefault(require("slash2"));

  _slash = function _slash() {
    return data;
  };

  return data;
}

function _child_process() {
  const data = require("child_process");

  _child_process = function _child_process() {
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

var _ = _interopRequireDefault(require(".."));

var _context = _interopRequireDefault(require("../../context"));

var _yaml = _interopRequireDefault(require("../../utils/yaml"));

var _moduleResolver = require("../../utils/moduleResolver");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * remark plugin for generate file meta
 */
function meta() {
  return (ast, vFile) => {
    var _ctx$umi2;

    if (this.data('fileAbsPath')) {
      var _ctx$umi;

      const filePath = (0, _slash().default)(_path().default.relative(((_ctx$umi = _context.default.umi) === null || _ctx$umi === void 0 ? void 0 : _ctx$umi.cwd) || process.cwd(), this.data('fileAbsPath'))); // append file info

      vFile.data.filePath = filePath; // try to read file update time from git history

      try {
        vFile.data.updatedTime = parseInt((0, _child_process().execSync)(`git log -1 --format=%at ${this.data('fileAbsPath')}`, {
          stdio: 'pipe'
        }).toString(), 10) * 1000;
      } catch (err) {
        /* nothing */
      } // fallback to file update time

      /* istanbul ignore if */


      if (Number.isNaN(Number(vFile.data.updatedTime))) {
        vFile.data.updatedTime = Math.floor(_fs().default.lstatSync(this.data('fileAbsPath')).mtimeMs);
      } // try to find related component of this md


      if (/(index|readme)?(\.[\w-]+)?\.md/.test(this.data('fileAbsPath'))) {
        try {
          (0, _moduleResolver.getModuleResolvePath)({
            extensions: ['.tsx'],
            basePath: process.cwd(),
            sourcePath: _path().default.dirname(this.data('fileAbsPath')),
            silent: true
          }); // presume A is the related component of A/index.md
          // TODO: find component from entry file for a precise result

          vFile.data.componentName = _path().default.basename(_path().default.parse(this.data('fileAbsPath')).dir);
        } catch (err) {
          /* nothing */
        }
      }
    } // save frontmatters


    (0, _unistUtilVisit().default)(ast, 'yaml', node => {
      var _data$hero;

      const data = (0, _yaml.default)(node.value); // parse markdown for features in home page

      if (data.features) {
        data.features.forEach(feat => {
          if (feat.desc) {
            feat.desc = _.default.markdown(feat.desc, null, {
              type: 'html'
            }).content;
          }
        });
      } // parse markdown for desc in home page


      if ((_data$hero = data.hero) === null || _data$hero === void 0 ? void 0 : _data$hero.desc) {
        data.hero.desc = _.default.markdown(data.hero.desc, null, {
          type: 'html'
        }).content;
      } // parse markdown for footer in home page


      if (data.footer) {
        data.footer = _.default.markdown(data.footer, null, {
          type: 'html'
        }).content;
      } // save frontmatter to data


      vFile.data = Object.assign(vFile.data || {}, data);
    }); // apply for assets command

    if (((_ctx$umi2 = _context.default.umi) === null || _ctx$umi2 === void 0 ? void 0 : _ctx$umi2.applyPlugins) && vFile.data.componentName) {
      _context.default.umi.applyPlugins({
        key: 'dumi.detectAtomAsset',
        type: _context.default.umi.ApplyPluginsType.event,
        args: {
          identifier: vFile.data.componentName,
          name: vFile.data.title,
          uuid: vFile.data.uuid,
          // use to parse props from component file
          _sourcePath: _path().default.join(_path().default.dirname(this.data('fileAbsPath')), 'index.tsx')
        }
      });
    }
  };
}
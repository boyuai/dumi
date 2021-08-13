"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = embed;
exports.EMBED_SLUGS = void 0;

function _fs() {
  const data = _interopRequireDefault(require("fs"));

  _fs = function _fs() {
    return data;
  };

  return data;
}

function _url() {
  const data = _interopRequireDefault(require("url"));

  _url = function _url() {
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

var _moduleResolver = require("../../utils/moduleResolver");

var _getFileContent = require("../../utils/getFileContent");

var _utils = require("../utils");

var _ = _interopRequireDefault(require(".."));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const EMBED_SLUGS = 'dumi-embed-file-slugs';
/**
 * remark plugin for parse embed tag to external module
 */

exports.EMBED_SLUGS = EMBED_SLUGS;

function embed() {
  return ast => {
    (0, _unistUtilVisit().default)(ast, 'element', (node, i, parent) => {
      if ((0, _hastUtilIsElement().default)(node, 'embed') && (0, _hastUtilHasProperty().default)(node, 'src')) {
        const src = node.properties.src;

        const parsed = _url().default.parse(src);

        const absPath = (0, _moduleResolver.getModuleResolvePath)({
          basePath: this.data('fileAbsPath'),
          sourcePath: parsed.pathname,
          extensions: [],
          silent: true
        });

        if (absPath) {
          const hash = decodeURIComponent(parsed.hash || '').replace('#', '');
          const query = new URLSearchParams();

          let content = _fs().default.readFileSync(absPath, 'utf8').toString(); // generate loader query


          if (hash[0] === 'L') {
            query.append('range', hash);
            content = (0, _getFileContent.getFileRangeLines)(content, hash);
          } else if (hash.startsWith('RE-')) {
            query.append('regexp', hash.substring(3));
            content = (0, _getFileContent.getFileContentByRegExp)(content, hash.substring(3), absPath);
          }

          const moduleReqPath = `${absPath}${String(query) ? `?${query}` : ''}`; // process node via file type

          switch (_path().default.extname(parsed.pathname)) {
            case '.md':
            default:
              // replace original node
              parent.children.splice(i, 1, {
                type: 'element',
                tagName: 'React.Fragment',
                properties: {
                  // eslint-disable-next-line no-new-wrappers
                  children: new String(`React.createElement(${(0, _utils.isDynamicEnable)() ? `dynamic({
                          loader: async () => import(/* webpackChunkName: "embedded_md" */ '${moduleReqPath}'),
                        })` : `require('${moduleReqPath}').default`})`),
                  [EMBED_SLUGS]: _.default.markdown(content, absPath, {
                    noCache: true
                  }).meta.slugs
                },
                position: node.position
              });
          }
        }
      }
    });
  };
}
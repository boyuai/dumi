"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _githubSlugger() {
  const data = _interopRequireDefault(require("github-slugger"));

  _githubSlugger = function _githubSlugger() {
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

function _hastUtilToString() {
  const data = _interopRequireDefault(require("hast-util-to-string"));

  _hastUtilToString = function _hastUtilToString() {
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

var _embed = require("./embed");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const slugs = (0, _githubSlugger().default)();
const headings = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

function filterValidChildren(children) {
  return children.filter(item => {
    return item.type !== 'element' || !/^[A-Z]/.test(item.tagName);
  });
}
/**
 * rehype plugin for collect slugs & add id for headings
 */


var _default = () => (ast, vFile) => {
  // initial slugs & reset slugger
  slugs.reset();
  vFile.data.slugs = [];
  (0, _unistUtilVisit().default)(ast, 'element', node => {
    // visit all heading element
    if ((0, _hastUtilIsElement().default)(node, headings)) {
      const title = (0, _hastUtilToString().default)({
        children: filterValidChildren(node.children),
        value: node.value
      }); // generate id if not exist

      if (!(0, _hastUtilHasProperty().default)(node, 'id')) {
        node.properties.id = slugs.slug(title, false);
      } // save slugs


      vFile.data.slugs.push({
        depth: parseInt(node.tagName[1], 10),
        value: title,
        heading: node.properties.id
      }); // use first title as page title if not exist

      if (!vFile.data.title) {
        vFile.data.title = title;
      }
    } // visit all embed files


    if ((0, _hastUtilHasProperty().default)(node, _embed.EMBED_SLUGS)) {
      vFile.data.slugs.push(...node.properties[_embed.EMBED_SLUGS]);
      delete node.properties[_embed.EMBED_SLUGS];
    }
  });
};

exports.default = _default;
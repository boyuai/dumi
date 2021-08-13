"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = loader;

var _transformer = _interopRequireDefault(require("../transformer"));

var _loader2 = _interopRequireDefault(require("../theme/loader"));

var _getFileContent = require("../utils/getFileContent");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function loader(_x) {
  return _loader.apply(this, arguments);
}

function _loader() {
  _loader = _asyncToGenerator(function* (raw) {
    let content = raw;
    const params = new URLSearchParams(this.resourceQuery);
    const range = params.get('range');
    const regexp = params.get('regexp'); // extract content of markdown file

    if (range) {
      content = (0, _getFileContent.getFileRangeLines)(content, range);
    } else if (regexp) {
      content = (0, _getFileContent.getFileContentByRegExp)(content, regexp, this.resourcePath);
    }

    const result = _transformer.default.markdown(content, this.resourcePath, {
      noCache: content !== raw,
      throwError: true
    });

    const theme = yield (0, _loader2.default)();
    return `
    import React from 'react';
    import { dynamic } from 'dumi';
    import { Link, AnchorLink } from 'dumi/theme';
    ${theme.builtins.concat(theme.fallbacks).map(component => `import ${component.identifier} from '${component.source}';`).join('\n')}
    import DUMI_ALL_DEMOS from '@@/dumi/demos';

    ${(result.meta.demos || []).join('\n')}

    export default (props) => {
      // scroll to anchor after page component loaded
      React.useEffect(() => {
        if (props?.location?.hash) {
          AnchorLink.scrollToAnchor(decodeURIComponent(props.location.hash.slice(1)));
        }
      }, []);

      return (
        <>
          ${(result.meta.translateHelp || '') && `<Alert>${typeof result.meta.translateHelp === 'string' ? result.meta.translateHelp : 'This article has not been translated yet. Want to help us out? Click the Edit this doc on GitHub at the end of the page.'}</Alert>`}
          ${result.content}
        </>
      );
  }`;
  });
  return _loader.apply(this, arguments);
}
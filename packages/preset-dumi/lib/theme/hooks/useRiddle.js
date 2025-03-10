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

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

const RIDDLE_API_ENDPOINT = 'https://riddle.alibaba-inc.com/riddles/define';
let isInternalNetwork;

const useInternalNet = () => {
  const _useState = (0, _react().useState)(Boolean(isInternalNetwork)),
        _useState2 = _slicedToArray(_useState, 2),
        isInternal = _useState2[0],
        setIsInternal = _useState2[1];

  (0, _react().useEffect)(() => {
    if (isInternalNetwork === undefined) {
      // detect network via img request
      const img = document.createElement('img'); // interrupt image pending after 200ms

      setTimeout(() => {
        img.src = '';
        img.remove();
      }, 200);

      img.onload = () => {
        isInternalNetwork = true;
        setIsInternal(true);
        img.remove();
      };

      img.src = 'https://private-alipayobjects.alipay.com/alipay-rmsdeploy-image/rmsportal/RKuAiriJqrUhyqW.png';
    }
  }, []);
  return isInternal;
};
/**
 * get js code for Riddle
 * @param opts  previewer props
 */


function getRiddleAppCode(opts) {
  var _dependencies$react;

  const dependencies = opts.dependencies;
  let result = opts.sources._.tsx || opts.sources._.jsx; // convert export default to ReactDOM.render for riddle

  result = result.replace(/^/, `import ReactDOM from 'react-dom@${((_dependencies$react = dependencies.react) === null || _dependencies$react === void 0 ? void 0 : _dependencies$react.version) || 'latest'}';\n`).replace('export default', 'const DumiDemo =').concat('\nReactDOM.render(<DumiDemo />, mountNode);'); // add version for dependencies

  result = result.replace(/(from ')((?:@[^/'"]+)?[^/'"]+)/g, (_, $1, $2) => {
    let dep = `${$1}${$2}`;

    if (dependencies[$2]) {
      dep += `@${dependencies[$2].version}`;
    }

    return dep;
  });
  return result;
}

var _default = opts => {
  const _useState3 = (0, _react().useState)(),
        _useState4 = _slicedToArray(_useState3, 2),
        handler = _useState4[0],
        setHandler = _useState4[1];

  const isInternal = useInternalNet();
  (0, _react().useEffect)(() => {
    if (opts && isInternal && // TODO: riddle is not support multiple files for currently
    Object.keys(opts.sources).length === 1) {
      const form = document.createElement('form');
      const input = document.createElement('input');
      form.method = 'POST';
      form.target = '_blank';
      form.style.display = 'none';
      form.action = RIDDLE_API_ENDPOINT;
      form.appendChild(input);
      form.setAttribute('data-demo', opts.title || '');
      input.name = 'data'; // create riddle data

      input.value = JSON.stringify({
        title: opts.titlle,
        js: getRiddleAppCode(opts),
        css: Object.entries(opts.dependencies).filter(([, dep]) => dep.css).map(([name, {
          version,
          css
        }]) => // generate to @import '~pkg@version/path/to/css' format
        `@import '~${css.replace(new RegExp(`^(${name})`), `$1@${version}`)}';`).join('\n')
      });
      document.body.appendChild(form);
      setHandler(() => () => form.submit());
      return () => form.remove();
    }
  }, [opts, isInternal]);
  return handler;
};

exports.default = _default;
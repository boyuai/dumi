"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = previewer;

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

function _unistUtilVisit() {
  const data = _interopRequireDefault(require("unist-util-visit"));

  _unistUtilVisit = function _unistUtilVisit() {
    return data;
  };

  return data;
}

function _utils() {
  const data = require("@umijs/utils");

  _utils = function _utils() {
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

var _context = _interopRequireDefault(require("../../context"));

var _demo = _interopRequireWildcard(require("../demo"));

var _ = _interopRequireDefault(require(".."));

var _utils2 = require("../utils");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const debug = (0, _utils().createDebug)('dumi:previewer');
/**
 * cache id for each external demo file
 */

const externalCache = new Map();
/**
 * record external demo id count
 */

const externalIdMap = new Map();
/**
 * record code block demo id count
 */

const mdCodeBlockIdMap = new Map();
/**
 * get unique id for previewer
 * @param yaml          meta data
 * @param mdAbsPath     md absolute path
 * @param codeAbsPath   code absolute path, it is seem as mdAbsPath for embed demo
 * @param componentName the name of related component
 */

function getPreviewerId(yaml, mdAbsPath, codeAbsPath, componentName) {
  let id = yaml.identifier || yaml.uuid; // do not generate identifier for inline demo

  if (yaml.inline) {
    return;
  }

  if (!id) {
    if (mdAbsPath === codeAbsPath) {
      // for code block demo, format: component-demo-N
      const idMap = mdCodeBlockIdMap.get(mdAbsPath);

      const prefix = componentName || _path().default.basename((0, _slash().default)(mdAbsPath).replace(/(?:\/(?:index|readme))?(\.[\w-]+)?\.md/i, '$1'));

      id = `${prefix}-demo`; // record id count

      const currentIdCount = idMap.get(id) || 0;
      idMap.set(id, currentIdCount + 1); // append count suffix

      id += currentIdCount ? `-${currentIdCount}` : '';
    } else {
      // for external demo, format: dir-file-N
      // use cache first
      id = externalCache.get(codeAbsPath);

      if (!id) {
        const words = (0, _slash().default)(codeAbsPath) // discard index & suffix like index.tsx
        .replace(/(?:\/index)?(\.[\w-]+)?\.\w+$/, '$1').split(/\//).map(w => w.toLowerCase()); // /path/to/index.tsx -> to || /path/to.tsx -> to

        const demoName = words[words.length - 1] || 'demo';
        const prefix = words.slice(0, -1).filter(word => !/^(src|_?demos?|_?examples?)$/.test(word)).pop();
        id = `${prefix}-${demoName}`; // record id count

        const currentIdCount = externalIdMap.get(id) || 0;
        externalIdMap.set(id, currentIdCount + 1); // append count suffix

        id += currentIdCount ? `-${currentIdCount}` : '';
        externalCache.set(codeAbsPath, id);
      }
    }
  }

  return id;
}
/**
 * transform meta data for node
 * @param meta  node meta data from attribute & frontmatter
 */


function transformNodeMeta(meta) {
  Object.keys(meta).forEach(key => {
    const matched = key.match(/^desc(?:(\.[\w-]+$)|$)/); // compatible with short-hand usage for description field in previous dumi versions

    if (matched) {
      key = `description${matched[1] || ''}`;
      meta[key] = meta[matched[0]];
      delete meta[matched[0]];
    } // transform markdown for description field


    if (/^description(\.|$)/.test(key)) {
      meta[key] = _.default.markdown(meta[key], null, {
        type: 'html'
      }).content;
    }
  });
  return meta;
}
/**
 * transform demo node to real component
 * @param node        demo node
 * @param mdAbsPath   md absolute path
 */


function transformCode(node, mdAbsPath) {
  // export external demo directly
  return node.properties.filePath ? (0, _utils2.encodeImportRequire)(node.properties.filePath) : (0, _demo.default)(node.properties.source.tsx || node.properties.source.jsx, {
    isTSX: Boolean(node.properties.source.tsx),
    fileAbsPath: node.properties.filePath || mdAbsPath
  }).content;
}
/**
 * generate previewer props for demo node
 * @param node        demo node
 * @param mdAbsPath   markdown file absolute file
 * @param identifier  exist previewId, will generate a new one if not passed
 */


function generatePreviewerProps(node, mdAbsPath, componentName, identifier) {
  const isExternalDemo = Boolean(node.properties.filePath);
  let fileAbsPath = mdAbsPath; // special process external demo

  if (isExternalDemo) {
    const lang = node.properties.filePath.match(/\.(\w+)$/)[1];

    const _transformer$code = _.default.code(_fs().default.readFileSync(node.properties.filePath, 'utf8').toString()),
          meta = _transformer$code.meta,
          content = _transformer$code.content;

    fileAbsPath = node.properties.filePath;
    node.properties.source = {
      [lang]: content
    }; // save original attr meta on code tag, for HMR

    node.properties._ATTR_META = node.properties._ATTR_META || node.properties.meta;
    node.properties.meta = Object.assign(meta, node.properties._ATTR_META);
  }

  let depChangeListener;
  const yaml = transformNodeMeta(node.properties.meta || {});
  const previewId = identifier || getPreviewerId(yaml, mdAbsPath, fileAbsPath, componentName);

  if (!yaml.inline && isExternalDemo) {
    const listener = () => {
      debug(`regenerate demo props for: ${node.properties.filePath}`); // update @@/demos module if external demo changed, to update previewerProps for page component

      try {
        applyDemo(generatePreviewerProps(node, mdAbsPath, componentName, previewId), transformCode(node, mdAbsPath));
      } catch (err) {
        /* nothing */
      }
    };

    listener._identifier = fileAbsPath;
    depChangeListener = listener;
  }

  const _getDepsForDemo = (0, _demo.getDepsForDemo)(node.properties.source.tsx || node.properties.source.jsx, {
    isTSX: Boolean(node.properties.source.tsx),
    fileAbsPath,
    depChangeListener
  }),
        files = _getDepsForDemo.files,
        dependencies = _getDepsForDemo.dependencies;

  return _objectSpread(_objectSpread({
    sources: _objectSpread({
      _: isExternalDemo ? Object.keys(node.properties.source).reduce((r, lang) => _objectSpread(_objectSpread({}, r), {}, {
        [lang]: (0, _utils2.encodeHoistImport)(node.properties.filePath)
      }), {}) : node.properties.source
    }, Object.keys(files).reduce((result, file) => _objectSpread(_objectSpread({}, result), {}, {
      [file]: {
        import: files[file].import,
        content: (0, _utils2.encodeHoistImport)(files[file].fileAbsPath)
      }
    }), {})),
    dependencies,
    componentName
  }, yaml), {}, {
    // to avoid user's identifier override internal logic
    identifier: previewId
  });
}
/**
 * apply code block detecting event
 * @param props previewer props
 * @param componentName the name of related component
 */


function applyCodeBlock(props, componentName) {
  var _ctx$umi;

  (_ctx$umi = _context.default.umi) === null || _ctx$umi === void 0 ? void 0 : _ctx$umi.applyPlugins({
    key: 'dumi.detectCodeBlock',
    type: _context.default.umi.ApplyPluginsType.event,
    args: {
      type: 'BLOCK',
      name: props.title,
      description: props.description,
      thumbnail: props.thumbnail,
      tags: props.tags,
      previewUrl: props.previewUrl,
      atomAssetId: componentName,
      identifier: props.identifier || props.uuid,
      // for HiTu DSM, deprecated
      uuid: props.uuid,
      dependencies: _objectSpread(_objectSpread({}, Object.entries(props.dependencies).reduce((deps, [pkg, {
        version
      }]) => Object.assign(deps, {
        [pkg]: {
          type: 'NPM',
          // TODO: get real version rule from package.json
          value: version
        }
      }), {})), Object.entries(props.sources).reduce((result, [file, {
        tsx,
        jsx,
        content
      }]) => Object.assign(result, {
        // handle main file
        [file === '_' ? `index.${tsx ? 'tsx' : 'jsx'}` : file]: {
          type: 'FILE',
          value: file === '_' ? // strip frontmatter for main file
          _.default.code((0, _utils2.decodeHoistImportToContent)(tsx || jsx)).content : (0, _utils2.decodeHoistImportToContent)(content)
        }
      }), {}))
    }
  });
}
/**
 * apply demo detecting event
 * @param props previewer props
 */


function applyDemo(props, code) {
  var _ctx$umi2;

  (_ctx$umi2 = _context.default.umi) === null || _ctx$umi2 === void 0 ? void 0 : _ctx$umi2.applyPlugins({
    key: 'dumi.detectDemo',
    type: _context.default.umi.ApplyPluginsType.event,
    args: {
      uuid: props.identifier,
      code,
      previewerProps: props
    }
  });
}

const visitor = function visitor(node, i, parent) {
  var _node$properties;

  if (node.tagName === 'div' && ((_node$properties = node.properties) === null || _node$properties === void 0 ? void 0 : _node$properties.type) === 'previewer') {
    var _this$vFile$data$demo, _ctx$umi3;

    // generate previewer props
    const previewerProps = generatePreviewerProps(node, this.data('fileAbsPath'), this.vFile.data.componentName); // generate demo node

    const code = transformCode(node, this.data('fileAbsPath')); // declare demo on the top page component for memo

    const demoComponentCode = previewerProps.inline ? // insert directly for inline demo
    `React.memo(${(0, _utils2.decodeImportRequireWithAutoDynamic)(code, 'demos_md_inline')})` : // render other demo from the common demo module: @@/dumi/demos
    `React.memo(DUMI_ALL_DEMOS['${previewerProps.identifier}'].component)`;
    this.vFile.data.demos = (this.vFile.data.demos || []).concat(`const ${_demo.DEMO_COMPONENT_NAME}${(((_this$vFile$data$demo = this.vFile.data.demos) === null || _this$vFile$data$demo === void 0 ? void 0 : _this$vFile$data$demo.length) || 0) + 1} = ${demoComponentCode};`); // replace original node

    if (((_ctx$umi3 = _context.default.umi) === null || _ctx$umi3 === void 0 ? void 0 : _ctx$umi3.env) === 'production' && previewerProps.debug) {
      // discard debug demo in production
      parent.children.splice(i, 1);
      this.vFile.data.demos.splice(this.vFile.data.demos.length - 1, 1);
    } else if (previewerProps.inline) {
      parent.children[i] = {
        previewer: true,
        type: 'element',
        tagName: `${_demo.DEMO_COMPONENT_NAME}${this.vFile.data.demos.length}`
      };
    } else {
      // apply umi plugins
      applyCodeBlock(previewerProps, this.vFile.data.componentName);
      applyDemo(previewerProps, code);
      parent.children[i] = {
        previewer: true,
        type: 'element',
        tagName: 'Previewer',
        // TODO: read props from common @@/dumi/demos module to reduce bundle size
        properties: {
          'data-previewer-props-replaced': previewerProps.identifier
        },
        children: [{
          type: 'element',
          tagName: `${_demo.DEMO_COMPONENT_NAME}${this.vFile.data.demos.length}`,
          properties: {}
        }]
      };
    }
  }
};

function previewer() {
  // clear single paths for a new transform flow
  if (this.data('fileAbsPath')) {
    mdCodeBlockIdMap.set(this.data('fileAbsPath'), new Map());
  }

  return (ast, vFile) => {
    (0, _unistUtilVisit().default)(ast, 'element', visitor.bind({
      vFile,
      data: this.data
    }));
  };
}
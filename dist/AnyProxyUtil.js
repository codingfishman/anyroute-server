'use strict';

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _marked = /*#__PURE__*/_regenerator2.default.mark(loadDefaultRuleConfig),
    _marked2 = /*#__PURE__*/_regenerator2.default.mark(loadRuleConfig);

/**
* 管理AnyProxy实例的工具类
*/
var AnyProxy = require('anyproxy');
var path = require('path');
var mockRule = require('anyproxy-package-mock-response');
var co = require('co');
var process = require('process');
var util = require('./util');
var ModuleLoader = require('./ModuleLoader');

var ProxyCore = AnyProxy.ProxyCore;
var ProxyRecorder = AnyProxy.ProxyRecorder;
var INSTANCE_PROXY_RECORDER = new ProxyRecorder();
var DEFAULT_RULE_CONFIG_NAME = './route.config.js';
var ANYPROXY_DEFAULT_SETTINGS = {
  // the setttings for anyproxy core
  anyproxyCore: {
    port: 8001,
    dangerouslyIgnoreUnauthorized: true,
    forceProxyHttps: true,
    silent: true
  },
  // the configuration for anyproxy web interface
  anyproxyWeb: {
    enable: false,
    webPort: 8002
  }
};

// a global AnyProxy instance
var ANYPROXY_CORE_INSTANCE = null;

function loadDefaultRuleConfig() {
  var rootPath = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : process.cwd();
  var DEFAULT_RULE_CONFIG, defaultConfigPath;
  return _regenerator2.default.wrap(function loadDefaultRuleConfig$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          DEFAULT_RULE_CONFIG = {};
          defaultConfigPath = path.join(rootPath, DEFAULT_RULE_CONFIG_NAME);
          _context.prev = 2;

          console.info('==> try to load default route config at "' + defaultConfigPath + '"');
          _context.next = 6;
          return ModuleLoader.requireModule(defaultConfigPath);

        case 6:
          DEFAULT_RULE_CONFIG = _context.sent;
          _context.next = 12;
          break;

        case 9:
          _context.prev = 9;
          _context.t0 = _context['catch'](2);

          console.info('==> faild to load default config, will take no route config');

        case 12:
          return _context.abrupt('return', DEFAULT_RULE_CONFIG);

        case 13:
        case 'end':
          return _context.stop();
      }
    }
  }, _marked, this, [[2, 9]]);
}

function loadRuleConfig(configPath, rootPath) {
  return _regenerator2.default.wrap(function loadRuleConfig$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          if (!configPath) {
            _context2.next = 6;
            break;
          }

          _context2.next = 3;
          return ModuleLoader.requireModule(configPath);

        case 3:
          return _context2.abrupt('return', _context2.sent);

        case 6:
          _context2.next = 8;
          return loadDefaultRuleConfig(rootPath);

        case 8:
          return _context2.abrupt('return', _context2.sent);

        case 9:
        case 'end':
          return _context2.stop();
      }
    }
  }, _marked2, this);
}

function startProxyCore(configPath, rootPath) {
  var ACTIVE_OPTIONS = (0, _assign2.default)({}, ANYPROXY_DEFAULT_SETTINGS.anyproxyCore, {
    recorder: INSTANCE_PROXY_RECORDER
  });

  return co( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
    var port, ruleConfig;
    return _regenerator2.default.wrap(function _callee$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return util.getFreePort();

          case 2:
            port = _context3.sent;
            _context3.next = 5;
            return loadRuleConfig(configPath, rootPath);

          case 5:
            ruleConfig = _context3.sent;

            if (!(ruleConfig && mockRule.loadConfig)) {
              _context3.next = 11;
              break;
            }

            _context3.next = 9;
            return mockRule.loadConfig(ruleConfig);

          case 9:
            _context3.next = 13;
            break;

          case 11:
            _context3.next = 13;
            return mockRule.loadConfig({});

          case 13:
            ACTIVE_OPTIONS.rule = mockRule;
            ACTIVE_OPTIONS.port = port;
            ANYPROXY_CORE_INSTANCE = new ProxyCore(ACTIVE_OPTIONS);
            ANYPROXY_CORE_INSTANCE.start();
            return _context3.abrupt('return', port);

          case 18:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee, this);
  }));
}

function closeProxyCore() {
  return new _promise2.default(function (resolve) {
    if (ANYPROXY_CORE_INSTANCE) {
      ANYPROXY_CORE_INSTANCE.close().then(function (error) {
        console.info('===> AnyProxy shutdown');
        resolve(error);
      }).catch(function (e) {
        console.error('===> Failed to shutdown AnyProxy', e);
      });
    } else {
      resolve({});
    }
  });
}

function restartCore(ruleConfig) {
  closeProxyCore().then(function () {
    startProxyCore(ruleConfig);
  }).catch(function (e) {
    console.error('===> Restart AnyProxy failed :', e);
  });
}

module.exports = {
  startProxyCore: startProxyCore,
  closeProxyCore: closeProxyCore,
  restartCore: restartCore
};
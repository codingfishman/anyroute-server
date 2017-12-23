/**
* 管理AnyProxy实例的工具类
*/
const AnyProxy = require('anyproxy');
const path = require('path');
const mockRule = require('anyproxy-package-mock-response');
const co = require('co');
const process = require('process')
const util = require('./util');
const ModuleLoader = require('./ModuleLoader');

const ProxyCore = AnyProxy.ProxyCore;
const ProxyRecorder = AnyProxy.ProxyRecorder;
const INSTANCE_PROXY_RECORDER = new ProxyRecorder();
const DEFAULT_RULE_CONFIG_NAME = './route.config.js';
const ANYPROXY_DEFAULT_SETTINGS = {
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
let ANYPROXY_CORE_INSTANCE = null;

function *loadDefaultRuleConfig(rootPath = process.cwd()) {
  let DEFAULT_RULE_CONFIG = {};
  const defaultConfigPath = path.join(rootPath, DEFAULT_RULE_CONFIG_NAME);
  try {
    console.info(`==> try to load default route config at "${defaultConfigPath}"`);
    DEFAULT_RULE_CONFIG = yield ModuleLoader.requireModule(defaultConfigPath);
  } catch (e) {
    console.info('==> faild to load default config, will take no route config');
  }
  return DEFAULT_RULE_CONFIG;
}

function *loadRuleConfig(configPath, rootPath) {
  if (configPath) {
    return yield ModuleLoader.requireModule(configPath);
  } else {
    return yield loadDefaultRuleConfig(rootPath);
  }
}

function startProxyCore(configPath, rootPath) {
  const ACTIVE_OPTIONS = Object.assign({}, ANYPROXY_DEFAULT_SETTINGS.anyproxyCore, {
    recorder: INSTANCE_PROXY_RECORDER
  });

  return co(function *() {
    const port = yield util.getFreePort();
    const ruleConfig = yield loadRuleConfig(configPath, rootPath);
    if (ruleConfig && mockRule.loadConfig) {
      yield mockRule.loadConfig(ruleConfig);
    } else {
      yield mockRule.loadConfig({});
    }
    ACTIVE_OPTIONS.rule = mockRule;
    ACTIVE_OPTIONS.port = port;
    ANYPROXY_CORE_INSTANCE = new ProxyCore(ACTIVE_OPTIONS);
    ANYPROXY_CORE_INSTANCE.start();
    return port;
  })
}

function closeProxyCore() {
  return new Promise((resolve) => {
    if (ANYPROXY_CORE_INSTANCE) {
      ANYPROXY_CORE_INSTANCE.close()
        .then((error) => {
          console.info('===> AnyProxy shutdown');
          resolve(error);
        })
        .catch((e) => {
          console.error('===> Failed to shutdown AnyProxy', e);
        });
    } else {
      resolve({});
    }
  });
}

function restartCore(ruleConfig) {
  closeProxyCore()
    .then(() => {
      startProxyCore(ruleConfig);
    })
    .catch((e) => {
      console.error('===> Restart AnyProxy failed :', e);
    });
}

module.exports = {
  startProxyCore,
  closeProxyCore,
  restartCore
};

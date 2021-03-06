'use strict';

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var proxyUtil = require('./util');
var path = require('path');
var fs = require('fs');
var request = require('request');
var os = require('os');

var cachePath = os.tmpdir();

/**
 * download a file and cache
 *
 * @param {any} url
 * @returns {string} cachePath
 */
function cacheRemoteFile(url) {
  return new _promise2.default(function (resolve, reject) {
    request(url, function (error, response, body) {
      if (error) {
        return reject(error);
      } else if (response.statusCode !== 200) {
        return reject('failed to load with a status code ' + response.statusCode);
      } else {
        var fileCreatedTime = proxyUtil.formatDate(new Date(), 'YYYY_MM_DD_hh_mm_ss');
        var random = Math.ceil(Math.random() * 500);
        var fileName = 'remote_module_' + fileCreatedTime + '_r' + random + '.js';
        var filePath = path.join(cachePath, fileName);
        fs.writeFileSync(filePath, body);
        resolve(filePath);
      }
    });
  });
}

/**
 * load a local npm module
 *
 * @param {any} filePath
 * @returns module
 */
function loadLocalPath(filePath) {
  return new _promise2.default(function (resolve, reject) {
    var moduleFilePath = path.resolve(process.cwd(), filePath);
    if (fs.existsSync(moduleFilePath)) {
      resolve(require(moduleFilePath));
    } else {
      resolve(require(filePath));
    }
  });
}

/**
 * load a module from url or local path
 *
 * @param {any} urlOrPath
 * @returns module
 */
function requireModule(urlOrPath) {
  return new _promise2.default(function (resolve, reject) {
    if (/^http/i.test(urlOrPath)) {
      resolve(cacheRemoteFile(urlOrPath));
    } else {
      resolve(urlOrPath);
    }
  }).then(function (localPath) {
    return loadLocalPath(localPath);
  });
}

module.exports = {
  cacheRemoteFile: cacheRemoteFile,
  loadLocalPath: loadLocalPath,
  requireModule: requireModule
};
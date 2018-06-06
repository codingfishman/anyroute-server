'use strict';

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
* format the date string
* @param date Date or timestamp
* @param formatter YYYYMMDDHHmmss
*/
module.exports.formatDate = function (date, formatter) {
  if ((typeof date === 'undefined' ? 'undefined' : (0, _typeof3.default)(date)) !== 'object') {
    date = new Date(date);
  }
  var transform = function transform(value) {
    return value < 10 ? '0' + value : value;
  };
  return formatter.replace(/^YYYY|MM|DD|hh|mm|ss/g, function (match) {
    switch (match) {
      case 'YYYY':
        return transform(date.getFullYear());
      case 'MM':
        return transform(date.getMonth() + 1);
      case 'mm':
        return transform(date.getMinutes());
      case 'DD':
        return transform(date.getDate());
      case 'hh':
        return transform(date.getHours());
      case 'ss':
        return transform(date.getSeconds());
      default:
        return '';
    }
  });
};

/**
* get a free port 
*/
module.exports.getFreePort = function () {
  return new _promise2.default(function (resolve, reject) {
    var server = require('net').createServer();
    server.unref();
    server.on('error', reject);
    server.listen(0, function () {
      var port = server.address().port;
      server.close(function () {
        resolve(port);
      });
    });
  });
};
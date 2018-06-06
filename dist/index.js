'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var events = require('events');
var staticServer = require('koa-viewer').default;
var koa = require('koa');
var request = require('request');
var AnyProxyUtil = require('./AnyProxyUtil');

var DEFAULT_PORT = '3000';

var AnyProxyServer = function (_events$EventEmitter) {
  (0, _inherits3.default)(AnyProxyServer, _events$EventEmitter);

  function AnyProxyServer(config) {
    (0, _classCallCheck3.default)(this, AnyProxyServer);

    var _this = (0, _possibleConstructorReturn3.default)(this, (AnyProxyServer.__proto__ || (0, _getPrototypeOf2.default)(AnyProxyServer)).call(this, config));

    _this.configPath = config.config;
    _this.port = config.port || DEFAULT_PORT;
    _this.rootPath = config.directory || process.cwd();
    _this.app = new koa();
    return _this;
  }

  (0, _createClass3.default)(AnyProxyServer, [{
    key: 'startKoa',
    value: function startKoa(proxyPort) {
      var _this2 = this;

      // handle proxy before really serving
      this.app.use(function () {
        var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(ctx, next) {
          var headers, host, method, fullUrl, proxyReq;
          return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  headers = ctx.headers;

                  ctx.set('Access-Control-Allow-Origin', '*');
                  ctx.set('Access-Control-Allow-Methods', '*');
                  ctx.set('Access-Control-Allow-Credentials', true);

                  if (!(headers['via-proxy'] === 'true')) {
                    _context.next = 9;
                    break;
                  }

                  _context.next = 7;
                  return next();

                case 7:
                  _context.next = 15;
                  break;

                case 9:
                  host = headers.host;
                  method = ctx.method;
                  fullUrl = 'http://' + host + ctx.url;

                  headers['via-proxy'] = 'true';
                  proxyReq = request({
                    method: method,
                    url: fullUrl,
                    headers: headers,
                    proxy: 'http://127.0.0.1:' + proxyPort,
                    rejectUnauthorized: false
                  });

                  ctx.body = ctx.req.pipe(proxyReq);

                case 15:
                case 'end':
                  return _context.stop();
              }
            }
          }, _callee, _this2);
        }));

        return function (_x, _x2) {
          return _ref.apply(this, arguments);
        };
      }());

      this.app.use(staticServer(this.rootPath));
      this.app.listen(this.port);
      console.log('Server is listening on ' + this.port);
    }
  }, {
    key: 'start',
    value: function start() {
      var _this3 = this;

      console.info('==> starting server now ...');
      AnyProxyUtil.startProxyCore(this.configPath, this.rootPath).then(function (proxyPort) {
        _this3.startKoa(proxyPort);
      });
    }
  }]);
  return AnyProxyServer;
}(events.EventEmitter);

module.exports = AnyProxyServer;
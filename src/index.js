
const events = require('events');
const staticServer = require('koa-viewer').default;
const koa = require('koa');
const request = require('request');
const AnyProxyUtil = require('./AnyProxyUtil');

const DEFAULT_PORT = '3000';

class AnyProxyServer extends events.EventEmitter {
  constructor(config) {
    super(config);
    this.configPath = config.config;
    this.port = config.port || DEFAULT_PORT;
    this.rootPath = config.directory || process.cwd();
    this.app = new koa();
  }

  startKoa(proxyPort) {
    // handle proxy before really serving
    this.app.use(async (ctx, next) => {
      const headers = ctx.headers;
      ctx.set('Access-Control-Allow-Origin', '*');
      ctx.set('Access-Control-Allow-Methods', '*');
      ctx.set('Access-Control-Allow-Credentials', true);
      if (headers['via-proxy'] === 'true') {
        await next();
      } else {
        const host = headers.host;
        const method = ctx.method;
        const fullUrl = `http://${host}${ctx.url}`;
        headers['via-proxy'] = 'true';
        const proxyReq = request({
          method,
          url: fullUrl,
          headers,
          proxy: `http://127.0.0.1:${proxyPort}`,
          rejectUnauthorized: false
        });
        ctx.body = ctx.req.pipe(proxyReq);
      }
    })

    this.app.use(staticServer(this.rootPath));
    this.app.listen(this.port);
    console.log(`Server is listening on ${this.port}`);
  }

  start() {
    console.info('==> starting server now ...')
    AnyProxyUtil.startProxyCore(this.configPath, this.rootPath)
      .then((proxyPort) => {
        this.startKoa(proxyPort);
      })
  }
}

module.exports = AnyProxyServer;

const Koa = require('koa');
const Router = require('koa-router');
const Static = require('koa-static');
const Cors = require('koa-cors');
const path = require('path');

const route35c3 = require('./route/35c3');

const app = new Koa();
const router = new Router();

route35c3(router);

app
  .use(Cors())
  .use(router.routes())
  .use(router.allowedMethods())
  .use(Static(path.resolve(__dirname, '../dist'), {}));

module.exports = app;
if (!module.parent) {
  app.listen(8080);
}
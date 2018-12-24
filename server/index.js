const Koa = require('koa');
const Router = require('koa-router');
const Static = require('koa-static');
const path = require('path');

const app = new Koa();
const router = new Router();

app
  .use(router.routes())
  .use(router.allowedMethods())
  .use(Static(path.resolve(__dirname, '../dist'), {}));

module.exports = app;
if (!module.parent) {
  app.listen(8080);
}

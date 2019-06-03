const Koa = require('koa');
const Router = require('koa-router');
const Static = require('koa-static');
const Cors = require('koa-cors');
const Mount = require('koa-mount');
const BodyParser = require('koa-bodyparser');
const path = require('path');

const routePictures = require('./route/pictures');
const route35c3 = require('./route/35c3');
const routeCalendar = require('./route/calendar');
const routeCBeamRPC = require('./route/cbeamRpc');

const app = new Koa();
const router = new Router();

route35c3(router);
routePictures(router);
routeCalendar(router);
routeCBeamRPC(router);

app
  .use(Cors())
  .use(BodyParser())
  .use(router.routes())
  .use(router.allowedMethods())
  .use(Static(path.resolve(__dirname, '../dist'), {}))
  .use(Mount('/videos', Static(path.resolve(__dirname, '../videos'), {
    setHeaders: (res) => {
      res.setHeader('cache-control', 'immutable');
    },
  })))
  .use(Mount('/pictures', Static(path.resolve(__dirname, '../pictures'), {
    setHeaders: (res) => {
      res.setHeader('cache-control', 'immutable');
    },
  })));

module.exports = app;
if (!module.parent) {
  app.listen(8080);
}

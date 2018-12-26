const path = require('path');
const fs = require('fs');
const { promisify } = require('util');

const fsStat = promisify(fs.stat);
const fsReadDir = promisify(fs.readdir);

module.exports = (router) => {
  router.get('/pictures/:folder', async (ctx) => {
    const folder = path.resolve(__dirname, `../../pictures/${path.basename(ctx.params.folder)}`);
    try {
      await fsStat(folder);
    } catch (e) {
      ctx.status = 404;
      return ctx;
    }
    const files = await fsReadDir(folder);
    ctx.body = files.map(f => `/pictures/${path.basename(ctx.params.folder)}/${f}`);
    return ctx;
  });
};

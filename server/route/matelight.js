require('isomorphic-fetch');

module.exports = (router) => {
  router.get('/matelight/:command', async (ctx) => {
    const { command } = ctx.params;
    const res = await fetch(`http://matelight.cbrp3.c-base.org/api/${command}`);
    ctx.assert((res.status === 200), res.status);
    const body = await res.json();
    ctx.body = body;
  });
  router.get('/matelight/:command/:argument', async (ctx) => {
    const { command, argument } = ctx.params;
    const res = await fetch(`http://matelight.cbrp3.c-base.org/api/${command}/${argument}`);
    ctx.assert((res.status === 200), res.status);
    const body = await res.json();
    ctx.body = body;
  });
};

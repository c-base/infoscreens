require('isomorphic-fetch');

module.exports = (router) => {
  router.post('/matelight/:command', async (ctx) => {
    const { command } = ctx.params;
    const res = await fetch(`http://matelight.cbrp3.c-base.org/api/${command}`);
    ctx.assert((res.status === 200), res.status);
    const body = await res.json();
    ctx.body = body;
  });
  router.post('/matelight/:command/:argument', async (ctx) => {
    console.log(ctx)
    const { command, argument } = ctx.params;
    const res = await fetch(`http://matelight.cbrp3.c-base.org/api/${command}/${argument}`);
    ctx.assert((res.status === 200), res.status);
    const body = await res.json();
    ctx.body = body;
  });
};

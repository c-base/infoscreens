require('isomorphic-fetch');

module.exports = (router) => {
  router.get('/rpc/:method', async (ctx) => {
    const res = await fetch('http://c-beam.cbrp3.c-base.org:4254/rpc/', {
      credentials: 'omit',
      headers: {
        'content-type': 'application/json',
      },
      body: `{"jsonrpc":"2.0","id":1550009052773,"method":"${ctx.params.method}","params":""}`,
      method: 'POST',
      mode: 'cors',
    });
    ctx.assert((res.status === 200), res.status);
    const body = await res.json();
    ctx.body = body;
  });
};

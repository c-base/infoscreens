require('isomorphic-fetch');

const rpcRequest = async (method, params = {}) => {
  const body = JSON.stringify({
    jsonrpc: '2.0',
    id: +new Date(),
    method,
    params,
  });
  const res = await fetch('http://c-beam.cbrp3.c-base.org:4254/rpc/', {
    headers: {
      'content-type': 'application/json',
    },
    mode: 'cors',
    credentials: 'omit',
    method: 'POST',
    body,
  });
  return res;
};

module.exports = (router) => {
  router.get('/rpc/:method', async (ctx) => {
    const res = await rpcRequest(ctx.params.method);
    ctx.assert((res.status === 200), res.status);
    const body = await res.json();
    ctx.body = body;
  });
  router.post('/rpc/:method', async (ctx) => {
    const res = await rpcRequest(ctx.params.method, ctx.request.body);
    ctx.assert((res.status === 200), res.status);
    const body = await res.json();
    ctx.body = body;
  });
};

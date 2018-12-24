require('isomorphic-fetch');

module.exports = (router) => {
  router.get('/35c3/fahrplan', async (ctx) => {
    const res = await fetch('https://fahrplan.events.ccc.de/congress/2018/Fahrplan/schedule.json');
    ctx.assert((res.status === 200), res.status);
    const body = await res.json();
    ctx.body = body;
  });
};

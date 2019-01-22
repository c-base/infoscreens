require('isomorphic-fetch');

module.exports = (router) => {
  router.get('/calendar', async (ctx) => {
    const res = await fetch('https://www.c-base.org/calendar/exported/events.json');
    ctx.assert((res.status === 200), res.status);
    const body = await res.json();
    ctx.body = body;
  });
};

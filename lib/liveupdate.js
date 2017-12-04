export function subscribe(timeseries, callback) {
  const socket = new WebSocket('ws://openmct.cbrp3.c-base.org:8082/');
  socket.addEventListener('open', () => {
    timeseries.forEach((series) => {
      socket.send(`subscribe ${series}`);
    });
  });
  socket.addEventListener('message', (msg) => {
    callback(JSON.parse(msg.data));
  });
}

export default subscribe;

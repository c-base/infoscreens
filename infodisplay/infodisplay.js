const { msgflo } = window.infodisplay;
let timeout = null;

function getRotationUrl(urls, current) {
  const newUrl = urls[Math.floor(Math.random() * urls.length)];
  if (newUrl === current && urls.length > 1) {
    // Flip the coin again
    return getRotationUrl(urls, current);
  }
  return newUrl;
}

function DisplayParticipant(broker, role, defaultUrls, timer) {
  let urls = defaultUrls;
  let participant;
  const def = {
    component: 'msgflo-browser/infodisplay',
    label: 'Browser-based information display',
    icon: 'television',
    inports: [
      {
        id: 'open',
        type: 'string',
      },
      {
        id: 'urls',
        type: 'array',
      },
    ],
    outports: [
      {
        id: 'opened',
        type: 'string',
      },
      {
        id: 'urls',
        type: 'array',
        hidden: true,
      },
    ],
  };
  const process = (inport, indata, callback) => {
    const current = document.getElementById('current');
    const next = document.getElementById('next');
    if (inport === 'urls') {
      // Update URL listing
      urls = indata;
      callback('urls', null, urls);
    }
    next.onerror = (err) => {
      next.onload = null;
      next.onerror = null;
      participant.send('open', getRotationUrl(urls, indata));
      callback('open', err);
    };
    next.onload = () => {
      next.onload = null;
      next.onerror = null;
      // Cross-fade
      next.id = 'current';
      current.id = 'next';
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => {
        participant.send('open', getRotationUrl(urls, indata));
      }, timer);
      callback('opened', null, next.getAttribute('src'));
    };
    next.setAttribute('src', indata);
    // Rotate internal URLs list
  };
  const client = new msgflo.mqtt.Client(broker, {});
  participant = new msgflo.participant.Participant(client, def, process, role);
  return participant;
}

window.addEventListener('load', () => {
  const params = msgflo.options({
    broker: 'mqtt://c-beam.cbrp3.c-base.org:1882',
    role: 'infodisplay',
    urls: [
      'http://c-beam.cbrp3.c-base.org/he1display',
      'https://c-base.org',
    ],
    timer: 120000,
  });
  const p = DisplayParticipant(params.broker, params.role, params.urls, params.timer);
  p.start((err) => {
    if (err) {
      console.error(err);
      return;
    }
    p.send('open', getRotationUrl(params.urls));
  });
}, false);

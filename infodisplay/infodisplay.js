import msgflo from 'msgflo-browser';

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
    component: 'c-base/infodisplay',
    label: 'Show URL on a public screen.',
    icon: 'television',
    inports: [
      {
        id: 'open',
        description: 'URL to be opened',
        type: 'string',
      },
      {
        id: 'urls',
        description: 'URL list for rotation',
        type: 'array',
      },
    ],
    outports: [
      {
        id: 'opened',
        description: 'The URL that has been opened and is showing.',
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
      return;
    }
    if (next.getAttribute('src') === indata) {
      // Already open!
      next.id = 'current';
      current.id = 'next';
      callback('opened', null, next.getAttribute('src'));
      return;
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

function onPageReady() {
  window.removeEventListener('load', onPageReady, false);
  const params = msgflo.options({
    broker: 'mqtt://c-beam.cbrp3.c-base.org:1882',
    role: 'infodisplay',
    urls: [
      'http://c-beam.cbrp3.c-base.org/he1display',
      'https://c-base.org',
    ],
    timer: 60000,
  });
  const p = DisplayParticipant(params.broker, params.role, params.urls, params.timer);
  p.start((err) => {
    if (err) {
      throw err;
    }
    p.send('open', getRotationUrl(params.urls));
  });
}
window.addEventListener('load', onPageReady, false);

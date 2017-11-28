var msgflo = window.infodisplay.msgflo;
var timeout = null;

var getRotationUrl = function (urls, current) {
  var newUrl = urls[Math.floor(Math.random() * urls.length)];
  if (newUrl === current && urls.length > 1) {
    // Flip the coin again
    return getRotationUrl(urls, current);
  }
  return newUrl;
};

var DisplayParticipant = function (broker, role, defaultUrls, timer) {
  var urls = defaultUrls;
  var def = {
    component: 'msgflo-browser/infodisplay',
    label: 'Browser-based information display',
    icon: 'television',
    inports: [
      {
        id: 'open',
        type: 'string'
      },
      {
        id: 'urls',
        type: 'array'
      }
    ],
    outports: [
      {
        id: 'opened',
        type: 'string'
      },
      {
        id: 'urls',
        type: 'array',
        hidden: true
      }
    ]
  };
  var process = function (inport, indata, callback) {
    var current = document.getElementById('current');
    var next = document.getElementById('next');
    if (inport === 'urls') {
      // Update URL listing
      urls = indata;
      return callback('urls', null, urls);
    }
    next.onerror = function (err) {
      next.onload = null;
      next.onerror = null;
      participant.send('open', getRotationUrl(urls, indata));
    }
    next.onload = function () {
      next.onload = null;
      next.onerror = null;
      // Cross-fade
      next.id = 'current';
      current.id = 'next';
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(function () {
        participant.send('open', getRotationUrl(urls, indata));
      }, timer);
      return callback('opened', null, next.getAttribute('src'));
    };
    next.setAttribute('src', indata);
    // Rotate internal URLs list
  };
  var client = new msgflo.mqtt.Client(broker, {});
  var participant = new msgflo.participant.Participant(client, def, process, role);
  return participant;
}

window.addEventListener('load', function () {
  var params = msgflo.options({
    broker: 'mqtt://c-beam.cbrp3.c-base.org:1882',
    role: 'infodisplay',
    urls: [
      'http://c-beam.cbrp3.c-base.org/he1display',
      'https://c-base.org'
    ],
    timer: 120000,
  });
  var p = DisplayParticipant(params.broker, params.role, params.urls, params.timer);
  p.start(function (err) {
    if (err) {
      console.error(err);
      return;
    }
    p.send('open', getRotationUrl(params.urls));
  });
}, false);

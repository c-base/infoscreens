import { withComponent, props } from 'skatejs';

function renderTime(duration) {
  const time = parseInt(duration, 10);
  let seconds = parseInt((time) % 60, 10);
  let minutes = parseInt((time / (60)) % 60, 10);
  let hours = parseInt(time / (60 * 60), 10);

  hours = (hours < 10) ? `0${hours}` : hours;
  minutes = (minutes < 10) ? `0${minutes}` : minutes;
  seconds = (seconds < 10) ? `0${seconds}` : seconds;

  return `${hours}:${minutes}:${seconds}`;
}

function renderProgress(elapsed, total) {
  if (!parseInt(total, 10)) {
    return '<progress></progress>';
  }
  return `<progress min="0" max="${total}" value="${elapsed}"></progress>`;
}

const Component = withComponent();
class MPD extends Component {
  static props = {
    mpd: props.string,
    data: props.object,
    interval: props.number,
  };

  connected() {
    if (!this.mpd) {
      return;
    }
    this.fetchData();
  }

  disconnecting() {
    if (this.timeout) {
      window.clearTimeout(this.timeout);
      delete this.timeout;
    }
  }

  fetchData() {
    delete this.timeout;
    const url = `https://c-beam.cbrp3.c-base.org/mpd/${this.mpd}/status/?_=${Date.now()}`;
    fetch(url, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      },
    })
      .then(data => data.json())
      .then((data) => {
        this.data = data.content;
        if (!this.interval) {
          return;
        }
        this.timeout = window.setTimeout(() => {
          this.fetchData();
        }, this.interval * 1000);
      });
  }

  renderer(renderRoot, render) {
    const root = renderRoot;
    while (root.firstChild) {
      root.removeChild(root.firstChild);
    }
    root.appendChild(render());
    const styles = document.createElement('style');
    styles.appendChild(document.createTextNode(`
      .artist, .song {
        color: #fff;
      }
      progress {
        -webkit-appearance: none;
        appearance: none;
        width: 40%;
      }
      progress::-webkit-progress-bar {
        background-color: #2e3436;
      }
      progress[value]::-webkit-progress-value {
        background-color: hsl(35, 98%, 46%);
      }
    `));
    root.appendChild(styles);
  }

  render({ data }) {
    const el = document.createElement('div');
    if (!data.state) {
      return el;
    }
    el.className = data.state;
    let status = 'Stopped';
    if (data.state === 'pause') {
      status = `${renderProgress(data.elapsed, data.total)} paused`;
    }
    if (data.state === 'play') {
      status = `${renderProgress(data.elapsed, data.total)} ${renderTime(data.elapsed)}/${renderTime(data.total)}`;
    }
    let artist = data.current_song.artist ? `${data.current_song.artist} - ${data.current_song.album}` : data.current_song.name;
    if (!artist) {
      artist = 'Unknown';
    }
    let volume = parseInt(data.volume, 10);
    if (volume < 0) {
      volume = 0;
    }
    el.innerHTML = `
      <div class="artist">${artist}</div>
      <div class="song">${data.current_song.title}</div>
      <div>${status}</div>
      <div><progress min="0" max="100" value="${volume}"></progress> volume ${volume}</div>
    `;
    return el;
  }
}

customElements.define('cbase-mpd', MPD);

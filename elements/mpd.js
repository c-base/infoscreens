import { withComponent, props } from 'skatejs';

function renderTime(duration) {
  let seconds = parseInt((duration)%60)
  let minutes = parseInt((duration/(60))%60)
  let hours = parseInt(duration/(60*60));

  hours = (hours < 10) ? "0" + hours : hours;
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;

  return hours + ":" + minutes + ":" + seconds;
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
    if (!this.interval) {
      return;
    }
    this.runInterval = window.setInterval(() => {
      this.fetchData();
    }, this.interval * 1000);
  }

  disconnecting() {
    if (this.runInterval) {
      window.clearInterval(this.runInterval);
      delete this.runInterval;
    }
  }

  fetchData() {
    const url = `https://c-beam.cbrp3.c-base.org/mpd/${this.mpd}/status/?_${Date.now()}`;
    fetch(url, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      }
    })
      .then(data => data.json())
      .then((data) => {
        this.data = data.content;
      });
  }

  renderer(renderRoot, render) {
    const root = renderRoot;
    while (root.firstChild) {
      root.removeChild(root.firstChild);
    }
    root.appendChild(render());
  }

  render({ data }) {
    const el = document.createElement('div');
    if (!data.state) {
      return el;
    }
    let status = 'Stopped';
    if (data.state === 'play') {
      status = 'Now playing';
    }
    let artist = data.current_song.artist ? `${data.current_song.artist} - ${data.current_song.album}` : data.current_song.name
    if (!artist) {
      artist = 'Unknown';
    }
    const elapsed = 
    el.innerHTML = `
      <div>${status}</div>
      <div>${artist}</div>
      <div>${data.current_song.title}</div>
      <div>${renderTime(data.elapsed)}/${renderTime(data.total)}</div>
      <div>&#128264; <progress min="0" max="100" value="${data.volume}"></progress></div>
    `;
    return el;
  }
}

customElements.define('cbase-mpd', MPD);

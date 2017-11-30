import { withComponent, props } from 'skatejs';
import dateformat from 'dateformat';

const Component = withComponent();
class Time extends Component {
  static props = {
    format: props.string,
    time: props.number,
    interval: props.number,
  };

  connected() {
    if (!this.time) {
      this.time = Date.now();
    }
    console.log(this.time, this.interval);
    if (!this.interval) {
      return;
    }
    this.runInterval = window.setInterval(() => {
      this.time = Date.now();
    }, this.interval * 1000);
  }

  disconnecting() {
    if (this.runInterval) {
      window.clearInterval(this.runInterval);
      delete this.runInterval;
    }
  }

  renderer(renderRoot, render) {
    const root = renderRoot;
    root.innerHTML = render();
  }

  render({ time, format }) {
    let useFormat = format || 'ddd ddS HH:MM:ss';
    return dateformat(new Date(time), useFormat);
  }
}

customElements.define('cbase-time', Time);

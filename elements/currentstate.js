import { withComponent, props } from 'skatejs';

const Component = withComponent();
class CurrentState extends Component {
  static props = {
    timeseries: props.string,
    status: props.boolean,
    statusknown: props.boolean,
    interval: props.number,
  };

  connected() {
    if (!this.timeseries) {
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
    const url = `http://openmct.cbrp3.c-base.org/telemetry/latest/${this.timeseries}`;
    fetch(url)
      .then(data => data.json())
      .then((data) => {
        if (data === null) {
          this.statusknown = false;
          this.status = false;
          return;
        }
        this.status = data;
        this.statusknown = true;
      });
  }

  renderer(renderRoot, render) {
    const root = renderRoot;
    while (root.firstChild) {
      root.removeChild(root.firstChild);
    }
    root.appendChild(render());
  }

  render({ status, statusknown }) {
    const el = document.createElement('div');
    el.style.width = '100%';
    el.style.height = '100%';
    if (!statusknown) {
      el.style.backgroundColor = '#555753';
      return el;
    }
    if (status) {
      el.style.backgroundColor = '#73d216';
    } else {
      el.style.backgroundColor = '#cc0000';
    }
    return el;
  }
}

customElements.define('cbase-currentstate', CurrentState);

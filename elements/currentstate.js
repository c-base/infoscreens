import { withComponent, props } from 'skatejs';

const Component = withComponent();
class CurrentState extends Component {
  static props = {
    timeseries: props.string,
    trueword: props.string,
    falseword: props.string,
    unknownword: props.string,
    status: props.boolean,
    statusknown: props.boolean,
    recent: props.boolean,
    showrecent: props.number,
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
    const url = `http://openmct.cbrp3.c-base.org/telemetry/latest/${this.timeseries}?timestamp=true`;
    fetch(url)
      .then(data => data.json())
      .then((data) => {
        if (data === null) {
          this.statusknown = false;
          this.status = false;
          this.recent = false;
          return;
        }
        this.status = data.value;
        this.statusknown = true;
        const now = new Date();
        const changed = new Date(data.timestamp);
        if (((now - changed) / 60000) < this.showrecent) {
          this.recent = true;
        } else {
          this.recent = false;
        }
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
      @-webkit-keyframes animaterecenton {
        from { background-color: #73d216; }
        to { background-color: #3465a4; }
      }
      .animaterecenton {
        -webkit-animation-name: animaterecenton;
        -webkit-animation-duration: 0.5s;
        -webkit-animation-iteration-count:infinite;
        -webkit-animation-direction: alternate;
      }
      @-webkit-keyframes animaterecentoff {
        from { background-color: #cc0000; }
        to { background-color: #edd400; }
      }
      .animaterecentoff {
        -webkit-animation-name: animaterecentoff;
        -webkit-animation-duration: 0.5s;
        -webkit-animation-iteration-count:infinite;
        -webkit-animation-direction: alternate;
      }
    `));
    root.appendChild(styles);
  }

  render({ status, statusknown, trueword, falseword, unknownword }) {
    console.log(this.showrecent, this.recent);
    const el = document.createElement('div');
    el.style.width = '100%';
    el.style.height = '100%';
    let content = '<slot></slot>';
    if (!statusknown) {
      el.style.backgroundColor = '#555753';
      if (unknownword) {
        content = `${content} ${unknownword}`;
      }
      el.innerHTML = content;
      return el;
    }
    if (status) {
      el.style.backgroundColor = '#73d216';
      if (trueword) {
        content = `${content} ${trueword}`;
      }
      if (this.recent) {
        el.className = 'animaterecenton';
      }
    } else {
      el.style.backgroundColor = '#cc0000';
      if (falseword) {
        content = `${content} ${falseword}`;
      }
      if (this.recent) {
        el.className = 'animaterecentoff';
      }
    }
    el.innerHTML = content;
    return el;
  }
}

customElements.define('cbase-currentstate', CurrentState);

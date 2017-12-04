import { withComponent, props } from 'skatejs';

const Component = withComponent();
class UserList extends Component {
  static props = {
    data: props.array,
    interval: props.number,
  };

  connected() {
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
    const url = 'https://c-beam.cbrp3.c-base.org/mechblast_json';
    fetch(url)
      .then(data => data.json())
      .then((data) => {
        this.data = data.userlist;
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
      @-webkit-keyframes blinker {
        from {opacity: 1.0;}
        to {opacity: 0.0;}
      }
      blink{
        text-decoration: blink;
        -webkit-animation-name: blinker;
        -webkit-animation-duration: 0.6s;
        -webkit-animation-iteration-count:infinite;
        -webkit-animation-timing-function:ease-in-out;
        -webkit-animation-direction: alternate;
      }
    `));
    root.appendChild(styles);
  }

  render({ data }) {
    const el = document.createElement('div');
    el.className = 'terminal';
    el.innerHTML = `
      <div>user@c-beam&gt; #who</div>
      <div>${data.join(', ')}</div>
      <div>total: ${data.length}</div>
      <div>user@c-beam&gt; <blink>_</blink></div>
    `;
    return el;
  }
}

customElements.define('cbase-userlist', UserList);

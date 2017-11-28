import { withComponent, props } from 'skatejs';
import { Timeseries } from '../lib/timeseries';

const Component = withComponent();

class Heatmap extends Component {
  static props = {
    timeseries: props.string,
    days: props.number,
    interpolate: props.boolean,
    accumulate: props.boolean,
  };
  connected() {
    this.enableFetch = true;
  }
  renderer(renderRoot, render) {
    const root = renderRoot;
    root.innerHtml = '';
    root.appendChild(render());
  }

  render({ timeseries, interpolate, accumulate, days }) {
    let daySlots = days;
    if (!daySlots) {
      daySlots = 7;
    }
    const el = document.createElement('div');
    if (!this.enableFetch) {
      // Not yet connected
      return el;
    }
    if (this.ts) {
      // We're re-rendering, cancel previous
      this.ts.canceled = true;
    }
    const ts = new Timeseries(timeseries, new Date(), daySlots);
    const data = [{
      x: ts.getSlotLabels(),
      y: ts.getDayLabels(),
      z: ts.prepareSlots(),
      type: 'heatmap',
      colorscale: [
        ['0.0', 'rgb(0, 0, 0)'],
        ['0.9', 'rgb(255, 0, 0)'],
        ['1.0', 'rgb(128, 0, 0)'],
      ],
      showlegend: false,
      showscale: false,
    }];
    const layout = {
      yaxis: {
        autorange: 'reversed',
        tickfont: {
          family: 'Source Code Pro',
        },
      },
      xaxis: {
        type: 'category',
        tickfont: {
          family: 'Source Code Pro',
        },
      },
      paper_bgcolor: 'transparent',
    };
    this.ts = ts;
    ts.getData({
      interpolate,
      accumulate,
    })
      .then((values) => {
        if (ts.canceled) {
          el.innerHTML = '';
          return;
        }
        data[0].z = values;
        Plotly.newPlot(el, data, layout, {
          staticPlot: true,
        });
      });
    return el;
  }
}

customElements.define('cbase-heatmap', Heatmap);

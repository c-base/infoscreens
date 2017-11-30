import { withComponent, props } from 'skatejs';
import { Timeseries } from '../lib/timeseries';

const Component = withComponent();

class Heatmap extends Component {
  static props = {
    timeseries: props.string,
    days: props.number,
    interpolate: props.boolean,
    accumulate: props.boolean,
    data: props.array,
  };
  connected() {
    if (!this.timeseries) {
      return;
    }
    const daySlots = this.days || 7;
    this.ts = new Timeseries(this.timeseries, new Date(), daySlots);
    this.ts.getData({
      interpolate: this.interpolate,
      accumulate: this.accumulate,
      usePreviousValue: false,
    })
      .then((values) => {
        this.data = values;
      });
  }
  renderer(renderRoot, render) {
    const root = renderRoot;
    root.innerHtml = '';
    root.appendChild(render());
  }

  render({ data, ts }) {
    const el = document.createElement('div');
    if (!data || !data.length || !ts) {
      // No data yet
      return el;
    }
    const graphData = [{
      x: ts.getSlotLabels(),
      y: ts.getDayLabels(),
      z: data,
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
      margin: {
        r: 0,
        t: 0,
        b: 0,
      },
    };
    Plotly.newPlot(el, graphData, layout, {
      staticPlot: true,
    });
    return el;
  }
}

customElements.define('cbase-heatmap', Heatmap);

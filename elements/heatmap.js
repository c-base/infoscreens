import { withComponent, props } from 'skatejs';
import { Timeseries } from '../lib/timeseries';
import injectCss from '../lib/plotly-shadowdom';
import { colors } from '../lib/colors';

const Component = withComponent();

class Heatmap extends Component {
  static props = {
    timeseries: props.string,
    days: props.number,
    interpolate: props.boolean,
    accumulate: props.boolean,
    data: props.array,
    width: props.number,
    height: props.number,
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
    while (root.firstChild) {
      root.removeChild(root.firstChild);
    }
    root.appendChild(render());
    injectCss(root);
  }

  render({ data, ts, width, height }) {
    const el = document.createElement('div');
    if (!data || !data.length || !ts) {
      // No data yet
      return el;
    }
    const graphWidth = Math.floor((window.innerWidth / 100) * (width || 40));
    const graphHeight = Math.floor((window.innerHeight / 100) * (height || 50));
    const graphData = [{
      x: ts.getSlotLabels(),
      y: ts.getDayLabels(),
      z: data,
      type: 'heatmap',
      colorscale: [
        ['0.0', 'rgb(0, 0, 0)'],
        ['1.0', colors[2]],
      ],
      showlegend: false,
      showscale: false,
    }];
    const layout = {
      autosize: false,
      width: graphWidth,
      height: graphHeight,
      yaxis: {
        autorange: 'reversed',
        tickfont: {
          family: 'Source Code Pro',
        },
        tickcolor: '#204a87',
        gridcolor: '#204a87',
      },
      xaxis: {
        type: 'category',
        tickfont: {
          family: 'Source Code Pro',
        },
        tickcolor: '#204a87',
        gridcolor: '#204a87',
      },
      font: {
        family: ['Source Code Pro', 'sans-serif'],
        size: 16,
        color: '#fff',
        outlineColor: 'transparent',
      },
      paper_bgcolor: 'transparent',
      margin: {
        r: 0,
        t: 0,
      },
    };
    Plotly.newPlot(el, graphData, layout, {
      staticPlot: true,
    });
    return el;
  }
}

customElements.define('cbase-heatmap', Heatmap);

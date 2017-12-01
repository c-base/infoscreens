import { withComponent, props } from 'skatejs';
import { Timeseries } from '../lib/timeseries';
import { colors } from '../lib/colors';
import injectCss from '../lib/plotly-shadowdom';

const Component = withComponent();

class Polar extends Component {
  static props = {
    timeseries: props.string,
    days: props.number,
    interpolate: props.boolean,
    accumulate: props.boolean,
    percentage: props.boolean,
    data: props.array,
    size: props.number,
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

  render({ percentage, data, ts, size }) {
    const el = document.createElement('div');
    if (!data || !data.length || !ts) {
      // No data yet
      return el;
    }
    const vmin = Math.min(window.innerWidth, window.innerHeight);
    const graphSize = Math.floor((vmin / 100) * (size || 40));
    const layout = {
      orientation: 270,
      direction: 'clockwise',
      angularaxis: {
        type: 'category',
        tickcolor: '#204a87',
      },
      radialaxis: {
        ticksuffix: percentage ? '%' : '',
        tickcolor: '#204a87',
      },
      font: {
        family: ['Source Code Pro', 'sans-serif'],
        size: 16,
        color: '#fff',
        outlineColor: 'transparent',
      },
      showlegend: false,
      paper_bgcolor: 'transparent',
      autosize: false,
      width: graphSize,
      height: graphSize,
    };
    let graphData = [];
    const dayLabels = ts.getDayLabels();
    ts.prepareSlots().forEach((day, dayIdx) => {
      graphData.push({
        r: day,
        t: ts.getSlotLabels(),
        name: dayLabels[dayIdx],
        type: 'area',
        marker: {
          color: colors[2],
        },
        opacity: 0.8,
        showlegend: false,
      });
    });
    if (percentage) {
      graphData = graphData.slice(0);
      const result = ts.getSlotLabels().map(() => 0);
      data.forEach((day) => {
        day.forEach((val, idx) => {
          result[idx] += val;
        });
      });
      graphData[0].r = result.map(r => Math.round((r / ts.days) * 100));
    } else {
      data.forEach((day, dayIdx) => {
        day.forEach((val, idx) => {
          graphData[dayIdx].r[idx] = val;
        });
      });
    }
    Plotly.newPlot(el, graphData, layout, {
      staticPlot: true,
    });
    return el;
  }
}

customElements.define('cbase-polar', Polar);

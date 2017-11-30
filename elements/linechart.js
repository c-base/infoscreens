import { withComponent, props } from 'skatejs';
import { Timeseries } from '../lib/timeseries';
import { colors } from '../lib/colors';

const Component = withComponent();

class LineChart extends Component {
  static props = {
    timeseries: props.string,
    days: props.number,
    interpolate: props.boolean,
    accumulate: props.boolean,
    data: props.array,
    shape: props.string,
  };


  connected() {
    if (!this.timeseries || !this.timeseries.length) {
      return;
    }
    const daySlots = this.days || 1;
    const endDate = new Date();
    const promises = this.timeseries.split(' ').map((dataset) => {
      const ts = new Timeseries(dataset, endDate, daySlots);
      if (!this.ts) {
        // We need one for labeling
        this.ts = ts;
      }
      return ts.getData({
        interpolate: this.interpolate,
        accumulate: this.accumulate,
        usePreviousValue: false,
      });
    });
    Promise.all(promises)
      .then((res) => {
        this.data = res;
      });
  }

  renderer(renderRoot, render) {
    const root = renderRoot;
    while (root.firstChild) {
      root.removeChild(root.firstChild);
    }
    root.appendChild(render());
  }

  joinDays(values, slotLabels) {
    let data = [];
    let labels = [];
    // Padding is hack for https://github.com/plotly/plotly.js/issues/1516
    let pad = '';
    values.forEach((val, idx) => {
      let vals = val;
      if (idx === values.length - 1) {
        // Last one, remove trailing zeros
        let lastVal = vals.length - 1;
        for (let i = lastVal; i > 0; i--) {
          if (vals[i] !== 0) {
            lastVal = i;
            break;
          }
        }
        vals = val.slice(0, lastVal);
      }
      data = data.concat(vals);
      labels = labels.concat(slotLabels.slice(0, vals.length).map(label => `${label}${pad}`));
      pad += ' ';
    });

    const daySlots = this.days || 1;
    if (data.length > daySlots * 24) {
      const surplus = data.length - daySlots * 24;
      data = data.slice(surplus);
      console.log(this.days * 24, surplus, data.length);
      labels = labels.slice(surplus);
    }

    return {
      data,
      labels,
    };
  }

  render({ data, ts, shape }) {
    const el = document.createElement('div');
    if (!data || !data.length || !ts) {
      // No data yet
      return el;
    }
    const lineShape = shape || 'spline';
    const graphData = data.map((values, idx) => {
      const d = this.joinDays(values, this.ts.getSlotLabels());
      const res = {
        x: d.labels,
        y: d.data,
        type: 'scatter',
        mode: 'lines',
        name: this.timeseries.split(' ')[idx],
        line: {
          shape: lineShape,
        },
      };
      if (colors[idx]) {
        res.line.color = colors[idx];
      }
      return res;
    });
    console.log(graphData);
    const layout = {
      yaxis: {
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
      legend: {
        orientation: 'h',
        x: 0,
        y: 0,
        font: {
          family: 'Source Code Pro',
        },
      },
      showlegend: true,
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
    };
    Plotly.newPlot(el, graphData, layout, {
      staticPlot: true,
    });
    return el;
  }
}

customElements.define('cbase-linechart', LineChart);

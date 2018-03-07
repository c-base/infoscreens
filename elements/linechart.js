import { withComponent, props } from 'skatejs';
import { colors } from '../lib/colors';
import { parseValue } from '../lib/values';
import { subscribe } from '../lib/liveupdate';
import injectCss from '../lib/plotly-shadowdom';

const Component = withComponent();

const legendLabel = (datasets, idx) => {
  const parts = datasets.map(set => set.split('.'));
  const uniques = parts[idx].filter((part, index) => {
    for (let i = 0; i < parts.length; i++) {
      if (parts[i][index] !== part) {
        return true;
      }
    }
    return false;
  });
  return uniques.join('.');
};

class LineChart extends Component {
  static props = {
    timeseries: props.string,
    days: props.number,
    data: props.array,
    shape: props.string,
    width: props.number,
    height: props.number,
    references: props.string,
  };

  connected() {
    if (!this.timeseries || !this.timeseries.length) {
      return;
    }
    const days = this.days || 1;
    const endDate = new Date();
    const startDate = new Date();
    const series = this.timeseries.split(' ');
    startDate.setDate(startDate.getDate() - days);
    const promises = series.map(dataset => this.fetch(dataset, startDate, endDate));
    Promise.all(promises)
      .then((res) => {
        this.data = res;
        this.subscribe(series);
      });
  }

  fetch(timeseries, start, end) {
    const url = `http://openmct.cbrp3.c-base.org/telemetry/${timeseries}?start=${start.getTime()}&end=${end.getTime()}`;
    return fetch(url)
      .then(data => data.json());
  }

  subscribe(timeseries) {
    subscribe(timeseries, (data) => {
      if (!this.el) {
        return;
      }
      const dataIdx = timeseries.indexOf(data.id);
      if (dataIdx === -1) {
        return;
      }
      Plotly.extendTraces(this.el, {
        y: [[parseValue(data.value)]],
        x: [[new Date(data.timestamp)]],
      }, [dataIdx]);
    });
  }

  renderer(renderRoot, render) {
    const root = renderRoot;
    this.el = null;
    while (root.firstChild) {
      root.removeChild(root.firstChild);
    }
    root.appendChild(render());
    injectCss(root);
  }

  render({ data, shape, width, height, references }) {
    const el = document.createElement('div');
    if (!data || !data.length) {
      // No data yet
      return el;
    }
    const lineShape = shape || 'spline';
    const graphWidth = Math.floor((window.innerWidth / 100) * (width || 40));
    const graphHeight = Math.floor((window.innerHeight / 100) * (height || 50));
    const datasets = this.timeseries.split(' ');
    const showLegend = (datasets.length > 1);
    const graphData = data.map((values, idx) => {
      const res = {
        y: values.map(point => parseValue(point.value)),
        x: values.map(point => new Date(point.timestamp)),
        type: 'scatter',
        mode: 'lines',
        name: legendLabel(datasets, idx),
        line: {
          shape: lineShape,
        },
      };
      if (colors[idx]) {
        res.line.color = colors[idx];
      }
      return res;
    });

    const shapes = references.split(' ').map((spec, idx) => {
      let colorIdx = data.length + idx;
      if (colorIdx > colors.length) {
        // Start cycle again
        colorIdx = idx;
      }
      let color = colors[colorIdx];
      const res = {
        type: 'line',
        xref: 'paper', // x relative to [0,1] "paper" axis
        yref: 'y',
        x0: 0,
        x1: 1,
        y0: parseFloat(spec),
        y1: parseFloat(spec),
        line: {
          color,
          width: 1,
        },
      };
      return res;
    });
    const layout = {
      autosize: false,
      width: graphWidth,
      height: graphHeight,
      yaxis: {
        tickfont: {
          family: 'Source Code Pro',
        },
        tickcolor: '#204a87',
        gridcolor: '#204a87',
      },
      xaxis: {
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
        font: {
          family: 'Source Code Pro',
        },
        x: 0,
        y: 1,
        bgcolor: 'rgba(0, 0, 0, 0.6)',
      },
      margin: {
        t: 0,
        r: 0,
      },
      showlegend: showLegend,
      shapes,
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
    };
    Plotly.newPlot(el, graphData, layout, {
      staticPlot: true,
    });
    this.el = el;
    return el;
  }
}

customElements.define('cbase-linechart', LineChart);

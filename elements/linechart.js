import { withComponent, props } from 'skatejs';
import { colors } from '../lib/colors';
import { parseValue } from '../lib//values';

const Component = withComponent();

const legendLabel = (datasets, idx) => {
  const parts = datasets.map(set => set.split('.'));
  let uniques = parts[idx].filter((part, idx) => {
    for (let i = 0; i < parts.length; i++) {
      if (parts[i][idx] !== part) {
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
    interpolate: props.boolean,
    accumulate: props.boolean,
    data: props.array,
    shape: props.string,
    width: props.number,
    height: props.number,
  };

  connected() {
    if (!this.timeseries || !this.timeseries.length) {
      return;
    }
    const days = this.days || 1;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const promises = this.timeseries.split(' ').map((dataset) => {
      return this.fetch(dataset, startDate, endDate);
    });
    Promise.all(promises)
      .then((res) => {
        this.data = res;
      });
  }

  fetch(timeseries, start, end) {
    const url = `http://openmct.cbrp3.c-base.org/telemetry/${timeseries}?start=${start.getTime()}&end=${end.getTime()}`;
    return fetch(url)
      .then(data => data.json())
  }

  renderer(renderRoot, render) {
    const root = renderRoot;
    while (root.firstChild) {
      root.removeChild(root.firstChild);
    }
    root.appendChild(render());

    // Hack for Shadow DOM compat
    const styles = document.createElement('style');
    styles.innerText = `
      .js-plotly-plot .plotly .main-svg {
            position: absolute;
            top: 0;
            left: 0;
            pointer-events: none;
        }`;
    root.appendChild(styles);
  }

  render({ data, shape, width, height }) {
    const el = document.createElement('div');
    if (!data || !data.length) {
      // No data yet
      return el;
    }
    const lineShape = shape || 'spline';
    const graphWidth = Math.floor(window.innerWidth / 100 * (width || 40));
    const graphHeight = Math.floor(window.innerHeight / 100 * (height || 50));
    const datasets = this.timeseries.split(' ');
    const showLegend = (datasets.length > 1) ? true : false;
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

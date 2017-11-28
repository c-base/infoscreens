import { withComponent, props } from 'skatejs';
import { Timeseries } from '../lib/timeseries';

const Component = withComponent();

class Polar extends Component {
  static props = {
    timeseries: props.string,
    days: props.number,
    interpolate: props.boolean,
    accumulate: props.boolean,
    percentage: props.boolean,
  };

  connected() {
    this.enableFetch = true;
  }

  renderer(renderRoot, render) {
    const root = renderRoot;
    root.innerHtml = '';
    root.appendChild(render());
  }

  render({ timeseries, interpolate, accumulate, percentage, days }) {
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
    };
    let data = [];
    const dayLabels = ts.getDayLabels();
    ts.prepareSlots().forEach((day, dayIdx) => {
      data.push({
        r: day,
        t: ts.getSlotLabels(),
        name: dayLabels[dayIdx],
        type: 'area',
        marker: {
          color: '#f57900',
        },
        opacity: 0.8,
        showlegend: false,
      });
    });
    this.ts = ts;
    ts.getData({
      interpolate,
      accumulate,
      usePreviousValue: false,
    })
      .then((values) => {
        if (ts.canceled) {
          el.innerHTML = '';
          return;
        }
        if (percentage) {
          data = data.slice(0);
          const result = ts.getSlotLabels().map(() => 0);
          values.forEach((day) => {
            day.forEach((val, idx) => {
              result[idx] += val;
            });
          });
          data[0].r = result.map(r => (r / ts.days) * 100);
        } else {
          values.forEach((day, dayIdx) => {
            day.forEach((val, idx) => {
              data[dayIdx].r[idx] = val;
            });
          });
        }
        Plotly.newPlot(el, data, layout, {
          staticPlot: true,
        });
      });
    return el;
  }
}

customElements.define('cbase-polar', Polar);

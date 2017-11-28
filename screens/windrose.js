const endDate = new Date();
const startDate = new Date();
startDate.setDate(startDate.getDate() - 7);
startDate.setHours(0, 0, 0);
const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
const timeSlots = 24;
const timeSeries = 'crew.online';
const accumulatePoints = false;
//const timeSeries = 'clima.pressure.txl';
//const accumulatePoints = false;
//const timeSeries = 'bar.open';
//const accumulatePoints = false;
const interpolate = true;
const usePreviousValue = false;
const source = `http://openmct.cbrp3.c-base.org/telemetry/${timeSeries}?start=${startDate.getTime()}&end=${endDate.getTime()}`;
const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function prepareSlots(defaultValue = 0) {
  const slots = [];
  for (let i = 0; i < days; i++) {
    daySlot = [];
    for (let ii = 0; ii < timeSlots; ii++) {
      daySlot.push(defaultValue);
    }
    slots.push(daySlot);
  }
  return slots;
}
prepareSlots();

function getDayLabels() {
  const labels = [];
  const day = new Date(startDate.getTime());
  for (let i = 0; i < days; i++) {
    labels.push(`${day.getDate()} ${weekDays[day.getDay()]}`);
    day.setHours(day.getHours() + 24);
  }
  return labels;
}

function pad(time) {
  let val = `${time}`;
  if (val.length === 1) {
    val = `0${time}`;
  }
  return val;
}

function getTimeLabels() {
  const labels = [];
  const day = new Date(startDate.getTime());
  day.setHours(0, 0, 0);
  for (let i = 0; i < timeSlots; i++) {
    let from = day.getHours();
    day.setHours(day.getHours() + (24 / timeSlots));
    let to = day.getHours();
    if (to === 0) {
      to = 24;
    }
    if (timeSlots === 24) {
      labels.push(`${pad(from)}`);
      continue;
    }
    labels.push(`${pad(from)}-${pad(to)}`);
  }
  return labels;
}

function flattenData(data, fromDay = 0, fromHour = 0) {
  const flattened = [];
  data.forEach((dayData, dayIdx) => {
    if (dayIdx < fromDay) {
      return;
    }
    dayData.forEach((point, hourIdx) => {
      if (dayIdx === fromDay && hourIdx <= fromHour) {
        return;
      }
      flattened.push(point);
    });
  });
  return flattened;
}

function parseValue(val) {
  if (typeof val === 'boolean') {
    if (val) {
      return 1;
    }
    return 0;
  }
  return parseFloat(val);
}

function mapData(data, accumulate = false) {
  const slots = prepareSlots(null);
  data.forEach((point) => {
    const pointDate = new Date(point.timestamp);
    const pointValue = parseValue(point.value);
    const daySlot = Math.floor((pointDate - startDate) / (1000 * 60 * 60 * 24));
    const timeSlot = Math.floor(pointDate.getHours() / (24 / timeSlots))
    if (slots[daySlot][timeSlot] === null) {
      slots[daySlot][timeSlot] = 0;
    }
    if (accumulate) {
      slots[daySlot][timeSlot] += pointValue;
    } else {
      slots[daySlot][timeSlot] = Math.max(pointValue, slots[daySlot][timeSlot]);
    }
  });

  // Deal with slots without data
  let prevVal = 0;
  slots.forEach((dayData, dayIdx) => {
    let prevValIdx = 0;
    dayData.forEach((val, idx) => {
      if (val !== null) {
        prevVal = val;
        prevValIdx = idx;
        return;
      }
      if (interpolate) {
        const flattened = flattenData(slots, dayIdx, idx);
        for (let nextSlot = 0; nextSlot < flattened.length; nextSlot++) {
          if (flattened[nextSlot] === null) {
            continue;
          }
          let nextVal = flattened[nextSlot];
          if (nextVal === prevVal) {
            dayData[idx] = prevVal;
            return;
          }
          let difference = 0;
          if (nextVal > prevVal) {
            difference = nextVal - prevVal;
          } else {
            difference = prevVal - nextVal;
          }
          let distance = nextSlot;
          let totalDistance = nextSlot + idx - prevValIdx;
          if (totalDistance < 1) {
            totalDistance = 1;
          }
          dayData[idx] = Math.max((difference / totalDistance * distance) + nextVal, 0);
          return;
        }
        dayData[idx] = 0;
        return;
      }
      if (usePreviousValue) {
        dayData[idx] = prevVal;
        return;
      }
      dayData[idx] = 0;
    });
  });

  return slots;
}

let layout = {
  orientation: 270,
  direction: 'clockwise',
  angularaxis: {
    type: 'category',
    tickcolor: '#f57900',
  },
  radialaxis: {
    ticksuffix: '',
    tickcolor: '#f57900',
  },
  font: {
    family: ['Source Code Pro', 'sans-serif'],
    size: 16,
    color: '#fff',
    outlineColor: 'transparent',
  },
  paper_bgcolor: 'transparent',
  width: window.innerHeight,
  height: window.innerHeight,
};
let options = {
  staticPlot: true,
};
const data = [];
const dayLabels = getDayLabels();
let color = [120, 120, 220];
prepareSlots().forEach((day, dayIdx) => {
  color[0] -= 10;
  color[1] -= 10;
  color[2] -= 10;
  data.push({
    r: day,
    t: getTimeLabels(),
    name: dayLabels[dayIdx],
    type: 'area',
    marker: {
      color: `rgb(${color[0]}, ${color[1]}, ${color[2]})`,
    },
    opacity: 0.8,
    showlegend: false,
  });
});
Plotly.newPlot('chart', data, layout, options);

fetch(source)
  .then((data) => data.json())
  .then((data) => mapData(data, accumulatePoints))
  .then((values) => {
    values.forEach((day, dayIdx) => {
      day.forEach((val, idx) => {
        //let modedVal = parseFloat(`${dayIdx}.${parseInt(val)}`);
        data[dayIdx].r[idx] = val;
      });
    });
    Plotly.newPlot('chart', data, layout, options);
    //Plotly.redraw('chart');
  });

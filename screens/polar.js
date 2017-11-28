const endDate = new Date();
const startDate = new Date();
startDate.setDate(startDate.getDate() - 90);
startDate.setHours(0, 0, 0);
const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
const timeSlots = 24;
const timeSeries = 'bar.open';
const source = `http://openmct.cbrp3.c-base.org/telemetry/${timeSeries}?start=${startDate.getTime()}&end=${endDate.getTime()}`;
const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function prepareSlots(defaultValue = 0) {
  const slots = [];
  daySlot = [];
  for (let ii = 0; ii < timeSlots; ii++) {
    daySlot.push(defaultValue);
  }
  slots.push(daySlot);
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

function mapData(data) {
  const slots = prepareSlots(null);
  const slotsSeen = [];
  data.forEach((point) => {
    const pointDate = new Date(point.timestamp);
    const pointValue = parseValue(point.value);
    const daySlot = Math.floor((pointDate - startDate) / (1000 * 60 * 60 * 24));
    const timeSlot = Math.floor(pointDate.getHours() / (24 / timeSlots))
    if (slotsSeen.indexOf(`${daySlot}_${timeSlot}`) !== -1) {
      return;
    }
    if (slots[0][timeSlot] === null) {
      slots[0][timeSlot] = 0;
    }
    slots[0][timeSlot] += pointValue;
    if (pointValue > 0) {
      slotsSeen.push(`${daySlot}_${timeSlot}`);
    }
  });

  // Normalize to percentages
  slots.forEach((dayData, dayIdx) => {
    dayData.forEach((val, idx) => {
      if (dayData[idx] === null) {
        // No data
        dayData[idx] = 0;
        return;
      }
      dayData[idx] = dayData[idx] / days * 100;
    });
  });

  return slots;
}

let layout = {
  orientation: 270,
  direction: 'clockwise',
  angularaxis: {
    type: 'category',
    tickcolor: '#204a87',
  },
  radialaxis: {
    ticksuffix: '%',
    tickcolor: '#204a87',
  },
  font: {
    family: ['Source Code Pro', 'sans-serif'],
    size: 16,
    color: '#fff',
    outlineColor: 'transparent',
  },
  //paper_bgcolor: 'rgba(0, 0, 0, 0.98)',
  paper_bgcolor: 'transparent',
  width: window.innerHeight,
  height: window.innerHeight,
  showlegend: false,
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
      color: '#f57900',
    },
    showlegend: false,
  });
});
Plotly.newPlot('chart', data, layout, options);

fetch(source)
  .then((data) => data.json())
  .then((data) => mapData(data))
  .then((values) => {
    values.forEach((day, dayIdx) => {
      day.forEach((val, idx) => {
        data[dayIdx].r[idx] = val;
      });
      console.log(data[dayIdx]);
    });
    Plotly.newPlot('chart', data, layout, options);
  });

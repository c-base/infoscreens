import { parseValue } from './values';

export class Timeseries {
  constructor(id, endDate, days = 7, slots = 24) {
    this.id = id;
    this.endDate = endDate;
    this.startDate = this.getStartDate(endDate, days);
    this.days = this.getDays();
    this.slots = slots;
  }

  getStartDate(endDate, days) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0);
    return startDate;
  }

  getDays() {
    return Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
  }

  prepareSlots(defaultValue = 0) {
    const timeSlots = [];
    for (let i = 0; i < this.days; i++) {
      const daySlot = [];
      for (let ii = 0; ii < this.slots; ii++) {
        daySlot.push(defaultValue);
      }
      timeSlots.push(daySlot);
    }
    return timeSlots;
  }

  getDayLabels() {
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const labels = [];
    const day = new Date(this.startDate.getTime());
    for (let i = 0; i < this.days; i++) {
      labels.push(`${day.getDate()} ${weekDays[day.getDay()]}`);
      day.setHours(day.getHours() + 24);
    }
    return labels;
  }

  getSlotLabels() {
    const labels = [];
    const day = new Date(this.startDate.getTime());
    const pad = (time) => {
      let val = `${time}`;
      if (val.length === 1) {
        val = `0${time}`;
      }
      return val;
    };

    day.setHours(0, 0, 0);
    for (let i = 0; i < this.slots; i++) {
      const from = day.getHours();
      day.setHours(day.getHours() + (24 / this.slots));
      let to = day.getHours();
      if (to === 0) {
        to = 24;
      }
      if (this.slots === 24) {
        labels.push(`${pad(from)}`);
      } else {
        labels.push(`${pad(from)}-${pad(to)}`);
      }
    }
    return labels;
  }

  flattenData(data, fromDay = 0, fromHour = 0) {
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

  mapData(data, options) {
    const slots = this.prepareSlots(null);
    data.forEach((point) => {
      const pointDate = new Date(point.timestamp);
      const pointValue = parseValue(point.value);
      const daySlot = Math.floor((pointDate - this.startDate) / (1000 * 60 * 60 * 24));
      const timeSlot = Math.floor(pointDate.getHours() / (24 / this.slots));
      if (slots[daySlot][timeSlot] === null) {
        slots[daySlot][timeSlot] = 0;
      }
      if (options.accumulate) {
        slots[daySlot][timeSlot] += pointValue;
      } else {
        slots[daySlot][timeSlot] = Math.max(pointValue, slots[daySlot][timeSlot]);
      }
    });

    // Deal with slots without data
    let prevVal = 0;
    slots.forEach((dayData, dayIdx) => {
      let prevValIdx = 0;
      const dayVals = dayData;
      dayVals.forEach((val, idx) => {
        if (val !== null) {
          prevVal = val;
          prevValIdx = idx;
          return;
        }
        if (options.interpolate) {
          const flattened = this.flattenData(slots, dayIdx, idx);
          for (let nextSlot = 0; nextSlot < flattened.length; nextSlot++) {
            if (flattened[nextSlot] === null) {
              continue;
            }
            const nextVal = flattened[nextSlot];
            if (nextVal === prevVal) {
              dayVals[idx] = prevVal;
              return;
            }
            let difference = 0;
            if (nextVal > prevVal) {
              difference = nextVal - prevVal;
            } else {
              difference = prevVal - nextVal;
            }
            const distance = nextSlot;
            let totalDistance = (nextSlot + idx) - prevValIdx;
            if (totalDistance < 1) {
              totalDistance = 1;
            }
            dayVals[idx] = Math.max(((difference / totalDistance) * distance) + nextVal, 0);
            return;
          }
          dayVals[idx] = 0;
          return;
        }
        if (options.usePreviousValue) {
          dayVals[idx] = prevVal;
          return;
        }
        dayVals[idx] = 0;
      });
    });
    return slots;
  }

  getUrl() {
    return `http://openmct.cbrp3.c-base.org/telemetry/${this.id}?start=${this.startDate.getTime()}&end=${this.endDate.getTime()}`;
  }

  getData(options) {
    return fetch(this.getUrl())
      .then(data => data.json())
      .then(data => this.mapData(data, options));
  }
}

export default Timeseries;

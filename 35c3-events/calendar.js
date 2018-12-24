import dateformat from 'dateformat';
import '../elements/time';

function sortEvents(a, b) {
  if (a.start < b.start) {
    return -1;
  }
  if (a.start > b.start) {
    return 1;
  }
  return 0;
}

function getEvents(number) {
  const now = new Date();
  return fetch('//airdrone.bergie.today:8080/35c3/fahrplan')
    .then(res => res.json())
    .then((res) => {
      // res.schedule.conference.days[0].rooms.Adams[0]
      const talks = [];
      res.schedule.conference.days.forEach((day) => {
        const dayEnd = new Date(day.day_end);
        if (dayEnd < now) {
          // Already done with this day
          return;
        }
        Object.keys(day.rooms).forEach((room) => {
          day.rooms[room].forEach((slot) => {
            const start = new Date(slot.date);
            const [durationH, durationM] = slot.duration.split(':').map(val => parseInt(val, 10));
            const end = new Date(slot.date);
            end.setHours(end.getHours() + durationH);
            end.setMinutes(end.getMinutes() + durationM);
            if (end < now) {
              // This event is already over
              return;
            }
            talks.push({
              allDay: false,
              start: start.toISOString(),
              end: end.toISOString(),
              title: slot.title,
              id: room,
            });
          });
        });
      });
      return talks;
    })
    .then(talks => fetch('https://launchlibrary.net/1.3/launch/next/2')
      .then(res => res.json())
      .then((res) => {
        const launches = res.launches.map((launch) => {
          const start = new Date(launch.windowstart);
          const end = new Date(launch.windowend);
          return {
            allDay: false,
            start: start.toISOString(),
            end: end.toISOString(),
            title: launch.name,
            id: launch.lsp.abbrev,
            type: 'launch',
          };
        });
        return launches;
      })
      .then((launches) => {
        console.log(launches, talks);
        const allEvents = talks.concat(launches);
        allEvents.sort(sortEvents);
        return allEvents.slice(0, number);
      }));
}

let prevDate = new Date();
function renderEvent(event, container) {
  const now = new Date();
  const row = document.createElement('tr');
  const time = document.createElement('td');
  time.className = 'time';
  const destination = document.createElement('td');
  destination.className = 'destination';
  const code = document.createElement('td');
  code.className = 'code';
  const status = document.createElement('td');
  status.className = 'status';
  const startDate = new Date(event.start);
  const pad = (t) => {
    let val = `${t}`;
    if (val.length === 1) {
      val = `0${val}`;
    }
    if (val.length === 2) {
      val = `0${val}`;
    }
    return val;
  };
  const cleanTitle = (title) => {
    let cleaned = title.replace(/\sBerlin$/, '');
    cleaned = cleaned.replace(/\sUser Group/, ' UG');
    return cleaned;
  };
  const timeFormat = 'HH:MM';
  if (event.allDay) {
    time.innerHTML = '--:--';
  } else {
    time.innerHTML = dateformat(startDate, timeFormat);
  }

  if (typeof event.id === 'number') {
    code.innerHTML = `C${pad(event.id)}`;
  } else {
    code.innerHTML = event.id;
  }
  destination.innerHTML = cleanTitle(event.title);
  if (event.type === 'launch') {
    destination.classList.add('launch');
  }

  if (startDate.toDateString() !== prevDate.toDateString()) {
    status.innerHTML = dateformat(startDate, 'dd.mm.');
  }
  if (startDate.toDateString() === now.toDateString()) {
    row.classList.add('today');
    if (startDate < now) {
      status.innerHTML = 'Ongoing';
      status.classList.add('ongoing');
    } else {
      status.innerHTML = 'Today';
    }
  }

  row.appendChild(status);
  row.appendChild(time);
  row.appendChild(destination);
  row.appendChild(code);
  container.appendChild(row);
  prevDate = startDate;
}

function render() {
  const table = document.getElementById('events');
  getEvents(17)
    .then((events) => {
      while (table.firstChild) {
        table.removeChild(table.firstChild);
      }
      events.forEach(event => renderEvent(event, table));
    });
}

function onPageReady() {
  window.removeEventListener('load', onPageReady, false);
  render();
  setInterval(render, 30000);
}
window.addEventListener('load', onPageReady, false);

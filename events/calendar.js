import dateformat from 'dateformat';
import '../elements/time';

function getEvents(number, callback) {
  const now = new Date();
  fetch('/../calendar')
    .then(res => res.json())
    .then((calendars) => {
      const allEvents = calendars.c_base_events.concat(
        calendars.c_base_regulars, calendars.c_base_seminars,
      );
      const current = allEvents.filter((event) => {
        if (event.id === 45) {
          return false;
        }
        const start = new Date(event.start);
        if ((!event.data || event.allDay) && start.toDateString() !== now.toDateString()) {
          return false;
        }
        const end = new Date(event.end);
        if (start > now) {
          return false;
        }
        if (end < now) {
          return false;
        }
        return true;
      });
      const upcoming = allEvents.filter((event) => {
        if (event.id === 45) {
          return false;
        }
        const start = new Date(event.start);
        if (start > now) {
          return true;
        }
        return false;
      });

      fetch('https://launchlibrary.net/1.3/launch/next/2')
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
          const events = current.concat(upcoming, launches);
          events.sort((a, b) => {
            if (a.start < b.start) {
              return -1;
            }
            if (a.start > b.start) {
              return 1;
            }
            return 0;
          });
          return callback(events.slice(0, number));
        })
        .catch(() => {
          const events = current.concat(upcoming);
          events.sort((a, b) => {
            if (a.start < b.start) {
              return -1;
            }
            if (a.start > b.start) {
              return 1;
            }
            return 0;
          });
          return callback(events.slice(0, number));
        });
    });
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
    code.innerHTML = `c${pad(event.id)}`;
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
  getEvents(17, (events) => {
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

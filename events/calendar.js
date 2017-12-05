import dateformat from 'dateformat';
import '../elements/time';

function getEvents(number) {
  const now = new Date();
  const allEvents = window.c_base_events.concat(window.c_base_regulars, window.c_base_seminars);
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
  return events.slice(0, number);
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

  code.innerHTML = `C${pad(event.id)}`;
  destination.innerHTML = cleanTitle(event.title);

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
  while (table.firstChild) {
    table.removeChild(table.firstChild);
  }
  const events = getEvents(17);
  events.forEach(event => renderEvent(event, table));
}

function onPageReady() {
  window.removeEventListener('load', onPageReady, false);
  render();
  setInterval(render, 30000);
}
window.addEventListener('load', onPageReady, false);

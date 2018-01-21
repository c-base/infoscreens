c-base information displays [![Build Status](https://travis-ci.org/c-base/infoscreens.svg?branch=master)](https://travis-ci.org/c-base/infoscreens) [![Greenkeeper badge](https://badges.greenkeeper.io/c-base/infoscreens.svg)](https://greenkeeper.io/)
===========================

[c-base](https://c-base.org/) has a set of information displays located around the station, showing various statistics, current events, and notifications.

These displays work by rendering different HTML screens loaded from a URL. The info displays each have their own rotation of URLs configured that they switch at frequent intervals. In addition it is possible to trigger a custom URL to be opened by a screen by sending it a [MsgFlo](https://msgflo.org/) message.

![Workshop dashboard screen](https://i.imgur.com/ivhN7z1.jpg)

We have several implementations of the infodisplay software:

* [browser infodisplay](https://github.com/c-base/infoscreens/tree/master/infodisplay) -- the primary implementation used by our static info displays, running in Chrome kiosk mode
* [mqttwebview](https://github.com/c-base/mqttwebview) -- Python implementation mostly used as Linux screensaver in interactive terminals
* [c-beam-viewer](https://github.com/c-base/c-beam-viewer) -- Android implementation for wall-mounted tablets

The standard MsgFlo signature provides an `open` inport for sending new URLs for a display to open, and `opened` outport to tell when a URL has been opened:

![Info display as seen in Flowhub](https://i.imgur.com/JO50dWR.png)

## Updating URL lists

Most of our infodisplays are deployed using Ansible. You can find the configuration in [c-flo repository](https://github.com/c-base/c-flo/tree/master/ansible).

The [host\_vars folder](https://github.com/c-base/c-flo/tree/master/ansible/host_vars) contains the per-display URL rotation configurations.

## Screens available

The URLs given here will generally only work inside the c-base member network.

### Area-specific dashboards

* [mainhall](http://c-flo.cbrp3.c-base.org/mainhall/)
* [mainhall (with music)](http://c-flo.cbrp3.c-base.org/mainhall-music/)
* [c-lab](http://c-flo.cbrp3.c-base.org/c_lab/)
* [c-lab (with music)](http://c-flo.cbrp3.c-base.org/c_lab-music/)
* [soundlab](http://c-flo.cbrp3.c-base.org/soundlab/)
* [weltenbaulab](http://c-flo.cbrp3.c-base.org/weltenbaulab/)
* [weltenbaulab (with music)](http://c-flo.cbrp3.c-base.org/weltenbaulab-music/)
* [nerdarea](http://c-flo.cbrp3.c-base.org/nerdarea/)
* [nerdarea (with music)](http://c-flo.cbrp3.c-base.org/nerdarea-music/)
* [workshop](http://c-flo.cbrp3.c-base.org/workshop/)
* [workshop (with music)](http://c-flo.cbrp3.c-base.org/workshop-music/)
* [robolab](http://c-flo.cbrp3.c-base.org/robolab/)
* [robolab (with music)](http://c-flo.cbrp3.c-base.org/robolab-music/)
* [he2](http://c-flo.cbrp3.c-base.org/he2/)

There are also screens available from c-beam:

* [he1](https://c-beam.cbrp3.c-base.org/he1display)
* [mechblast](https://c-beam.cbrp3.c-base.org/mechdisplay)

### Other screens

* [upcoming events](http://c-flo.cbrp3.c-base.org/events/)
* [bar historical data](http://c-flo.cbrp3.c-base.org/bar-history/)
* [bar status](http://c-flo.cbrp3.c-base.org/bar-status/)
* [internet traffic](http://c-flo.cbrp3.c-base.org/internet/)
* [alien alarm](http://c-flo.cbrp3.c-base.org/alien-alarm/)
* [camera warning](http://c-flo.cbrp3.c-base.org/camera-warning/)

There are also screens available from c-beam:

* [sensors and AP stats](https://c-beam.cbrp3.c-base.org/sensors)
* [today's events](https://c-beam.cbrp3.c-base.org/events)
* [timehole status](https://c-beam.cbrp3.c-base.org/ceitloch)
* [map of c-base](https://c-beam.cbrp3.c-base.org/c-base-map/)
* [open missions](https://c-beam.cbrp3.c-base.org/missions)
* [reddit posts](https://c-beam.cbrp3.c-base.org/reddit)
* [artefact registry](https://c-beam.cbrp3.c-base.org/artefacts)
* [weather conditions](https://c-beam.cbrp3.c-base.org/weather)
* [public transport conditions](https://c-beam.cbrp3.c-base.org/bvg)

### Visual paging

For visualizing textual information, there is the [visual paging screen](http://c-flo.cbrp3.c-base.org/visual-paging/).

This is typically triggered by a MsgFlo participant, for example the [boardingurl component](https://github.com/c-base/c-flo/blob/master/components/boardingurl.py).

## Development

Data visualization elements are built in ES6 with [SkateJS](http://skatejs.netlify.com/) and [Plotly](https://plot.ly/javascript/).

Screens are plain HTML that uses various data visualization elements.

### Data sources

The primary data source for building new information displays is the [c-base OpenMCT installation](http://openmct.cbrp3.c-base.org/) powered by [cbeam-telemetry-server](https://github.com/c-base/cbeam-telemetry-server). New MsgFlo participants can be configured to write there, making the data available for visualization.

In addition there are some APIs available in other systems like c-beam and the c-base website.

### Style guide

To fit in c-base, the screens should in general be dark and futuristic. You can find some common styling rules in [c-base.css](https://github.com/c-base/infoscreens/blob/master/theme/c-base.css).

Most of our info displays are 1080 landscape monitors, but we also have other sizes (including portait) in use.

Because of this, all sizing and positioning on the screens should use viewport units (`vh`, `vw`, `vmin`, `vmax`). An info screen should utilize the whole screen area.

The screens are often seen from afar, so using bright colors and big text is advisable.

### Deployment

This repository is deployed on the `c-flo` machine in `/opt/infoscreens`. Deploy new version with:

```bash
$ git pull
$ npm install
$ npm run build
```

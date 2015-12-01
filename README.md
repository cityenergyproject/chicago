# City Energy Project Building Map System

This repository contains the code for a highly configurable system to map buildings according to various kinds of energy efficiency data, to make critical data about urban sustainability and conservation visible and accessible to a wide array of potential audiences.

The site was commissioned by the [City Energy Project](http://www.cityenergyproject.org), a joint effort of the Natural Resources Defense Council (NRDC) and the Institute for Market Transformation (IMT). The City Energy Project is a national initiative to create healthier and more prosperous American cities by improving the energy efficiency of buildings. Working in partnership, the Project and cities will support innovative, practical solutions that cut energy waste, boost local economies, and reduce harmful pollution.

In close collaboration with partners at the City Energy Project, [Stamen Design](http://stamen.com) and [Ministry of Velocity](http://www.ministryofvelocity.com) designed and built the system in summer 2015. Stamen is a leading innovator in data visualization, with a long history of direct collaborations with industry leaders, universities, museums, and humanitarian organizations. Ministry of Velocity is an agile software engineering consultancy with decades of combined experience in building immersive experiences alongside startups, nonprofit organizations, and design agencies.

## Dependencies

### Software
This project uses gulp for build scripts.
Other dependencies are contained in `package.json` and `bower.json`.

City data is hosted on CartoDB. Each city data table is specified in its respective JSON file contained in src/cities.

#### Development

  Start webserver
  ```
    $ npm start
  ```

  Start livereload
  ```
    $ npm run watch
  ```

### Static Assets

Source files are in `src/`. The compiled files are in `dist/`.

```bash
npm run dist
```

to compile, and copy all site files to the `dist/` folder

## How do I install it?

  * clone the repo
  * make sure you have [node](https://nodejs.org/) and [bower](http://bower.io/) installed
  * in the root of the repo, run ```npm install```
  * in the root of the repo, run ```bower install```
  * in a separate terminal window run ```npm start```
  * point your browser to http://localhost:8080/

## How do I deploy it to the world?

You can fork a copy of the repository, and the `dist` directory will turn into your own version of the site via [Github Pages](https://pages.github.com).  Alternatively, you can host your own copy of the `dist` directory on your own web server.

For setup and configuration instructions, see the [Setup and Configuration guide](https://github.com/cityenergyproject/cityenergy/wiki/Setup-and-Configuration).

## Contributing

Bug reports and pull requests are welcome on GitHub at [https://github.com/cityenergyproject/cityenergy](https://github.com/cityenergyproject/cityenergy).

# City Energy Project

Visualizing the energy use of buildings in major cities for the City Energy Project.

This README is almost all boilerplate for now. We'll fill in the details as we begin work.

## Branches

* List, describe and link

To clone a specific branch (to prevent having to switch branches when working
on different components), use:

```bash
git clone git@github.com:stamen/repo-name.git -b <branch> repo-name-<branch>
```

## Dependencies

### Software

We know we're hosting all project data on CartoDB and hosting all code and documentation on Github (eventually in an open source repository).

#### Development
  Use npm, gulp for local building

  Start webserver
  ``` 
    $ gulp connect
  ```

  Start livereload
  ``` 
    $ gulp watch
  ```

### Data

* What data is this project working with? Describe the data itself in a sentence or three.
* What assumptions does the proejct make about data format or schema?
* Is this a static data project or does it require a database?
* Is there an existing database anyone installing or building on this should know about? Where is it?

### Static Assets

Source files are in /src 
```bash
  gulp
```
to compile, and copy to dist folder

## How do I install it?

  * clone the repo
  * make sure you have node and bower installed
  * in the root of the repo, run ```sudo npm install```
  * in the root of the repo, run ```bower install```
  * in a separate terminal window run ```gulp connect```
  * point your browswer to http://localhost:8080/

## How do I test it other than locally?

Do we have Prosthetic or any other special methods required for testing? Describe those here if so.

## How do I deploy it to the world?

If this is a live thing in the world, how do we push changes to the live thing?


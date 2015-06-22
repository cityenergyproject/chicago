require.config({
  paths: {
    jquery: 'lib/jquery',
    underscore: 'lib/underscore',
    backbone: 'lib/backbone',
    templates: '../templates'
  }
});

require([
  // Load our app module and pass it to our definition function
  'app',
], function(App){
  App.initialize();
});


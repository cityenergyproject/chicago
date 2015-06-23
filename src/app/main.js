require.config({
  paths: {
    jquery: 'lib/jquery',
    underscore: 'lib/underscore',
    backbone: 'lib/backbone',
    templates: '../templates'
  }
});

require([
  'app',
], function(App){
  App.initialize();
});


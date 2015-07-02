require.config({
  paths: {
    jquery: 'lib/jquery',
    underscore: 'lib/underscore',
    backbone: 'lib/backbone',
    d3: 'lib/d3',
    ionrangeslider: 'lib/ion.rangeslider',
    templates: '../templates'
  }
});

require([
  'app',
], function(App){
  App.initialize();
});


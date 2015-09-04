require.config({
  paths: {
    jquery: '//ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min',
    underscore: '//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min',
    backbone: '//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.2.1/backbone-min',
    d3: '//cdnjs.cloudflare.com/ajax/libs/d3/3.5.5/d3.min',
    ionrangeslider: '../lib/range-slider/ion.rangeSlider',
    templates: 'templates'
  },
  shim: {
    ionrangeslider: ['jquery']
  }
});

require([
  'app',
], function(App){
  App.initialize();
});


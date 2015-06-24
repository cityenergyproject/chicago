// Filename: router.js
define([
  'jquery',
  'underscore',
  'backbone',
  'views/map/MapView',
  'models/city/CityModel',
  'models/map/MapModel',
], function($, _, Backbone, MapView, CityModel, MapModel) {

  var AppRouter = Backbone.Router.extend({
    routes:{
        "":"root",
        ":cityname":"city",
        ":cityname/:layer":"layer"
    },

    initialize:function () {
    },

    root:function () {
      this.navigate('los_angeles', {trigger: true, replace: true});
    },

    city: function(name){
      var city = new CityModel();
      this.navigate('los_angeles/' + city.get('default_layer'), {trigger: true, replace: true});
    },

    layer: function(cityname, layername){
      var city = new CityModel(); //eventually this will init the current city - for now LA is default
      var map = new MapModel({city: city, current_layer: layername})
      var mapView = new MapView({model: map});
      mapView.render();
    }

  });
  var router = new AppRouter();
  Backbone.history.start();
});




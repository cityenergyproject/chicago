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
      this.city = new CityModel(); //eventually this will init the current city - for now LA is default
      this.map = new MapModel({city: this.city})
      this.mapView = new MapView({model: this.map});
    },

    root:function () {
      this.navigate('los_angeles', {trigger: true, replace: true});
    },

    city: function(name){
      var city = new CityModel();
      this.navigate('los_angeles/' + city.get('default_layer'), {trigger: true, replace: true});
    },

    layer: function(cityname, layername){
      this.map.set('current_layer', layername)
      this.mapView.render();
    }

  });
  var router = new AppRouter();
  Backbone.history.start();
  return AppRouter;
});




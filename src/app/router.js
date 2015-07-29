// Filename: router.js
define([
  'jquery',
  'underscore',
  'backbone',
  'views/map/MapView',
  'models/city/CityModel',
  'models/map/MapModel',
  'views/info/BuildingView',
], function($, _, Backbone, MapView, CityModel, MapModel, BuildingView) {

  var Router = Backbone.Router.extend({
    routes:{
        "":"root",
        ":cityname":"city",
        ":cityname/":"city",
        ":cityname/:year":"year",
        ":cityname/:year/":"year",
        ":cityname/:year/:layer":"layer",
        ":cityname/:year/:layer/":"layer"
    },

    root:function () {
      this.navigate('los_angeles', {trigger: true, replace: true});
    },

    city: function(cityname){
      CityController.load(this, cityname);
    },

// <<<<<<< HEAD
//     layer: function(cityname, layername){
//       CityController.load(this, cityname, layername);
// =======
    year: function(cityname, year){
      CityController.load(this, cityname, year);
    },

    layer: function(cityname, year, layername){
      CityController.load(this, cityname, year, layername);
// >>>>>>> add year select
    }

  });



  var CityController = {
// <<<<<<< HEAD
    // load: function(router, cityname, layername){
// =======
    load: function(router, cityname, year, layername){
      year = year || '';
// >>>>>>> add year select

      if (!this.city || this.city.get('url_name') !== cityname){
        this.city = new CityModel({url_name: cityname, year: year});
      }else{
        this.city.set('year', year);
      }
      
      layername = layername || '';

// <<<<<<< HEAD
//       router.navigate(cityname + '/' + layername, {trigger: false, replace: true});
// =======
      router.navigate(cityname + '/' + year + '/' + layername, {trigger: false, replace: true});
// >>>>>>> add year select
      this.render(layername);

      return this;
    },

    render: function(layername){

      this.initializeMap(layername);
      this.initializeBuildingView();

      return this;
    },

    initializeBuildingView: function(){
      this.buildingView = this.buildingView || new BuildingView({map: this.map, mapView: this.mapView});
    },

    initializeMap: function(layername){
      if (this.map){
        this.map.set({city: this.city});
      } else {
        this.map = new MapModel({city: this.city});
      }

      //set current_layer before initializing new MapView in order to avoid triggering layer change with empty layer
      this.map.set('current_layer', layername);
      this.mapView = this.mapView || new MapView({model: this.map});

      return this;
    }

  };


  return Router;
});




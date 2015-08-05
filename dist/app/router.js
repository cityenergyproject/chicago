// Filename: router.js
define([
  'jquery',
  'underscore',
  'backbone',
  'views/map/MapView',
  'models/city/CityModel',
  'models/map/MapModel',
  'views/building_comparison/BuildingComparisonView',
], function($, _, Backbone, MapView, CityModel, MapModel, BuildingComparisonView) {

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

    year: function(cityname, year){
      CityController.load(this, cityname, year);
    },

    layer: function(cityname, year, layername){
      CityController.load(this, cityname, year, layername);
    }

  });



  var CityController = {
    load: function(router, cityname, year, layername){
      this.state = this.state || new Backbone.Model.extend({});

      year = year || '';

      if (!this.city || this.city.get('url_name') !== cityname){
        this.city = new CityModel({url_name: cityname, year: year});
      }else{
        this.city.set('year', year);
        this.city.setupYear();
      }

      layername = layername || '';

      router.navigate(cityname + '/' + year + '/' + layername, {trigger: false, replace: true});
      this.render(layername);

      return this;
    },

    render: function(layername){
      this.initializeMap(layername);
      this.initializeBuildingView();
      this.state.set({layer: layername});
      return this;
    },

    initializeBuildingView: function(){
      this.buildingComparisonView = this.buildingComparisonView || new BuildingComparisonView({map: this.map, mapView: this.mapView});
    },

    initializeMap: function(layername){
      if (this.map){
        this.map.set({city: this.city});
      } else {
        this.map = new MapModel({city: this.city});
      }

      this.mapView = this.mapView || new MapView({model: this.map, state: this.state});

      return this;
    }

  };


  return Router;
});




// Filename: router.js
define([
  'jquery',
  'underscore',
  'backbone',
  'models/city/CityModel',
  'collections/CityBuildings',
  'views/map/MapView',
  'views/map/AddressSearchView',
  'views/map/YearControlView',
  'views/building_comparison/BuildingComparisonView',
], function($, _, Backbone, CityModel, CityBuildings, MapView, AddressSearchView, YearControlView, BuildingComparisonView) {
  var RouterState = Backbone.Model.extend({
    defaults: {
      year: 2014,
      url_name: 'los_angeles'
    },
    toUrl: function(){
      var layer = "";
      if (this.get('city'))
      return "/" + this.get('url_name') + "/" + this.get('year');
    },
    categories: function(){},
    filters: function(){},
    asBuildings: function() {
      return new CityBuildings(null, this.pick('tableName', 'cartoDbUser'));
    }
  });

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
    state: new RouterState({}),
    initialize: function(){
      var comparisonView = new BuildingComparisonView({state: this.state});
      var yearControlView = new YearControlView({state: this.state});
      var mapView = new MapView({state: this.state});
      var addressSearchView = new AddressSearchView({mapView: mapView, state: this.state});
      this.state.on('change', this.onChange, this);
      this.state.on('change:year', this.onDataSourceChange, this);
      this.state.on('change:url_name', this.onDataSourceChange, this);
    },
    onChange: function(){
      Backbone.history.navigate(this.state.toUrl(), {trigger: false, replace: true});
    },
    onDataSourceChange: function(){
      var city = new CityModel(this.state.pick('url_name', 'year'));
      city.on('sync', this.onCitySync, this);
      city.fetch();
      this.state.set({city: city});
    },
    onCitySync: function(city, results) {
      var availableYears = _.chain(results.years).keys().sort();
          stateYear = this.state.get('year'),
          isStateYearPresent = availableYears.contains(stateYear),
          latestYear = availableYears.last().value(),
          yearToSet = isStateYearPresent ? stateYear : latestYear,
          yearValues = results.years[yearToSet],
          yearDefaultLayer = yearValues.default_layer,
          stateLayer = this.state.get('layer'),
          layerToSet = stateLayer || yearDefaultLayer;
      this.state.set({
        year: yearToSet,
        layer: layerToSet,
        tableName: yearValues.table_name,
        cartoDbUser: results.cartoDbUser
      });
    },
    load: function(router, cityname, year, layer, params){
      this.state.set(_.extend({}, params, {url_name: cityname, year: year, layer: layer}));
    }
  };

  CityController.initialize();

  return Router;
});




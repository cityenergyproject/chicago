define([
  'underscore',
  'backbone',
  'collections/map/MapLayersCollection',
  'collections/CityBuildings',
], function(_, Backbone, MapLayersCollection, CityBuildings) {

  var CityModel = Backbone.Model.extend({

    initialize: function(){
      this.listenTo(this, 'change:year', this.setupCity)
      this.layers = this.layers || new MapLayersCollection(null, {city: this});
      this.loadCityConfig(this.get('url_name'));
    },

    loadCityConfig: function(url_name){
      this.fetch({ url: "/cities/" + url_name + ".json",
        success: function(model, response, options) {
          model.defaults = response;
          model.setupCity();
          model.trigger('cityLoaded');
        },
        error: function(model, response, options){
          alert("Unable to load city config file");
        }
      });
      return this;
    },

    setupCity: function(){
      this.set(this.defaults);
      this.setupYear();
    },

    setupYear: function(){
      var years = this.get('years')
      if (this.get('year') === undefined || this.get('year')===""){
        latest_year = _.chain(years).keys().sort().last().value();
        this.set('year', latest_year, {silent: true});
        Backbone.history.navigate(this.get('url_name') + '/' + this.get('year') + '/', {trigger: false});
      }
      var year_settings = years[this.get('year')];
      this.set(year_settings);
    },
    asBuildings: function() {
      return new CityBuildings(null, {city: this});
    }
  });

  return CityModel;

});

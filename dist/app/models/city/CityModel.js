define([
  'underscore',
  'backbone',
  'collections/map/MapLayersCollection'
], function(_, Backbone,MapLayersCollection) {

  var CityModel = Backbone.Model.extend({

    initialize: function(){
      var self = this;

      this.layers = this.layers || new MapLayersCollection(null, {city: this});

      this.loadCityConfig(this.get('url_name'));
      
    },

    loadCityConfig: function(url_name){
      this.fetch({ url: "/cities/" + url_name + ".json", 
        success: function(model, response, options) {
          model.set(response);
          model.trigger('cityLoaded');
        },
        error: function(model, response, options){
          alert("Unable to find city config file");
        }
      });

    },

    sortBuildingSetBy: function(sortedBy){
      if (this.get('currentBuildingSet')===undefined){return this;}
      var sorted = _.sortBy(this.get('currentBuildingSet'), sortedBy.field_name);
      sorted.__proto__.sortedBy = sortedBy;

      if (sortedBy.order=='desc'){
        this.set('currentBuildingSet', sorted.reverse());
      } else {
        this.set('currentBuildingSet', sorted)
      }
      
      return this;
    }

  });

  return CityModel;

});
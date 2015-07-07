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
        },
        error: function(model, response, options){
          alert("Unable to find city config file");
        }
      });

    },


  });

  return CityModel;

});
define([
  'underscore',
  'backbone',
  'models/map/LayerModel'
], function(_, Backbone, LayerModel) {

  var MapLayersCollection = Backbone.Collection.extend({
    model: LayerModel,

    defaults : {
    },

    initialize: function(){    
    },

    interactivity: function(){
      return "cartodb_id, property_id, address_1, city, property_name, " + this.pluck('field_name').join(', ');
    },

    filtersSQL: function(){
      var sql = this.map(function(layer){
        if(layer.get('filter')===undefined){return "";}
        return layer.get('field_name') + " BETWEEN " + layer.get('filter').join(' AND ') ;
      });
      return _.compact(sql).join(' AND ');
    }

  });

  return MapLayersCollection;

});
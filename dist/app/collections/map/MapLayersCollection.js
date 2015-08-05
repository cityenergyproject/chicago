define([
  'underscore',
  'backbone',
  'models/map/LayerModel',
  'models/map/CategoryLayerModel',
], function(_, Backbone, LayerModel, CategoryLayerModel) {

  var MapLayersCollection = Backbone.Collection.extend({
    model: LayerModel,

    initialize: function(models, params){
      this.city = params.city;
      this.listenTo(this.city, 'cityLoaded', this.initWithCity, this);
    },

    initWithCity: function(){
      this.listenTo(this.collection, 'reset', this.onBuildings, this);
    },
    onBuildings: function(buildings){
      var layers = this.city.get('map_layers').map(function(layer){
        _.extend(layer, {
          table_name: this.city.get('table_name'),
          data: _.pluck(buildings, layer.field_name)
        });
        if (layer.display_type=='category'){
          return new CategoryLayerModel(layer);
        }else{
          return new LayerModel(layer);
        }
      }, this);
      this.add(layers);
      this.trigger('updateLayers');
      this.listenTo(this.city, 'change:map_layers', this.update);
      this.listenTo(this.city, 'change:table_name', this.update);
      this.listenTo(this, 'change:filter', this.updateCurrentBuildingSet);
    },

    interactivity: function(){
      return 'cartodb_id, ' + _(this.city.get('popup_fields')).pluck('field').join(', ');

    }

  });

  return MapLayersCollection;

});

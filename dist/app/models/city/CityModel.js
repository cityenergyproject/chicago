define([
  'underscore',
  'backbone',
  'models/map/LayerModel',
], function(_, Backbone,LayerModel) {

  var CityModel = Backbone.Model.extend({

    //eventually we will populate this from a config file - for now just LA
    defaults : {
        name : 'Los Angeles',
        table_name : 'losangelestestdatasetcep_na_to_null_20150619',
        tileSource : 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
        center: [34.093041824023125, -118.30215454101562],
        zoom : 11,
        default_layer : 'year_built',
        map_layers : [
          {
            title: 'Energy Star Score',
            field_name: 'energy_star_score',
            display_type: 'range',
            min: 0,
            max: 100,
            range_slice_count: 10,
            color_range: ['#d73027', '#1a9850']
          },
          {
            title: 'Year Built',
            field_name: 'year_built',
            display_type: 'range',
            min: 1900,
            max: 2015,
            range_slice_count: 10,
            color_range: ['#C7E9B4', '#225EA8']
          }
        ]
    },

    initialize: function(){
      var layerOpts = this.get('map_layers').map(function(layer){
        return _.extend(layer, {table_name: this.get('table_name')});
      }, this);

      this.layers = new Backbone.Collection(layerOpts, {model: LayerModel});
    }

  });

  return CityModel;

});
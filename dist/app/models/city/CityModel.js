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
            title: 'Year Built',
            field_name: 'year_built',
            display_type: 'range',
            min: 1900,
            max: 2015,
            range_slice_count: 10,
            color_range: ['#C7E9B4', '#225EA8']
          },
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
            title: 'Gas Use',
            field_name: 'weather_normalized_site_natural_gas_use_therms',
            display_type: 'range',
            min: 0,
            max: 170000,
            range_slice_count: 30,
            color_range: ['#dd8d01', '#B10026']
          },
          {
            title: 'Electricity Use',
            field_name: 'weather_normalized_site_electricity_kwh',
            display_type: 'range',
            min: 15000,
            max: 9100000,
            range_slice_count: 30,
            color_range: ['#0080ff', '#fff2cc', '#ff4d4d']
          },
          {
            title: 'Water Use',
            field_name: 'water_use_all_water_sources_kgal',
            display_type: 'range',
            min: 0,
            max: 19000,
            range_slice_count: 30,
            color_range: ['#7fbfff', '#0080ff']
          },

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
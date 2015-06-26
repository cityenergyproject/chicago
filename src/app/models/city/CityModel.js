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
            title: 'Square Feet',
            field_name: 'property_floor_area_buildings_and_parking_ft',
            display_type: 'range',
            min: 0,
            max: 773202,
            range_slice_count: 30,
            color_range: ['#dd8d01', '#B10026']
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
            title: 'Energy Use',
            field_name: 'weather_normalized_site_energy_use_kbtu',
            display_type: 'range',
            min: 53977,
            max: 44508309,
            range_slice_count: 30,
            color_range: ['#1a9850', '#d73027']
          },
          {
            title: 'Energy Use per Sq Ft',
            field_name: 'weather_normalized_site_electricity_intensity_kwh_ft',
            display_type: 'range',
            min: 0,
            max: 210,
            range_slice_count: 30,
            color_range: ['#1a9850', '#d73027']
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
            title: 'Energy Cost',
            field_name: 'energy_cost',
            display_type: 'range',
            min: 2767,
            max: 1426500,
            range_slice_count: 30,
            color_range: ['#7fbfff', '#0080ff']
          },
          {
            title: 'Energy Cost Intensity ($/ft²)',
            field_name: 'energy_cost_intensity_ft',
            display_type: 'range',
            min: 0.27,
            max: 139,
            range_slice_count: 30,
            color_range: ['#7fbfff', '#b10026']
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
          {
            title: 'Total Water Cost',
            field_name: 'total_water_cost_all_water_sources',
            display_type: 'range',
            min: 0,
            max: 134644,
            range_slice_count: 30,
            color_range: ['#7fbfff', '#0080ff']
          },

          {
            title: 'Total GHG Emissions (Metric Tons CO2e)',
            field_name: 'total_ghg_emissions_metric_tons_co2e',
            display_type: 'range',
            min: 0,
            max: 3192,
            range_slice_count: 30,
            color_range: ['#1a9850', '#d73027']
          },
          {
            title: 'Direct GHG Emissions Intensity (kgCO2e/ft²)',
            field_name: 'direct_ghg_emissions_intensity_kgco2e_ft',
            display_type: 'range',
            min: 0,
            max: 8,
            range_slice_count: 30,
            color_range: ['#1a9850', '#d73027']
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
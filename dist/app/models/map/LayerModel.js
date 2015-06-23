define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var LayerModel = Backbone.Model.extend({

    defaults : {
        title : 'Building Types',
        field_name : 'primary_property_type___epa_calculated',
        baseCSS : [
            '{marker-fill: #999;',
            'marker-fill-opacity: 0.8;',
            'marker-line-color: #FFF;',
            'marker-line-width: 0.5;',
            'marker-line-opacity: 1;',
            'marker-placement: point;',
            'marker-multi-policy: largest;',
            'marker-type: ellipse;',
            'marker-allow-overlap: true;',
            'marker-clip: false;}'
        ]
    },

    initialize: function(map){
      this.map = map //parent map model
    },

    cartoCSS: function(){
      var typeBuckets = [
          {name: 'K-12 School', value: '#A6CEE3'},
          {name: 'Office', value: '#1F78B4'},
          {name: 'Medical Office', value: '#52A634'},
          {name: 'Warehouse', value: '#B2DF8A'},
          {name: 'College/University', value: '#33A02C'},     
          {name: 'Retail', value: '#E31A1C'},
          {name: 'Municipal', value: '#FDBF6F'},
          {name: 'Multifamily', value: '#FF7F00'},
          {name: 'Hotel', value: '#CAB2D6'},
          {name: 'Industrial', value: '#6A3D9A'},
          {name: 'Worship', value: '#9C90C4'},
          {name: 'Supermarket', value: '#E8AE6C'},
          {name: 'Parking', value: '#62afe8'},
          {name: 'Laboratory', value: '#3AA3FF'},
          {name: 'Hospital', value: '#C6B4FF'},
          {name: 'Data Center', value: '#a3d895'},
          {name: 'Unknown', value: '#DDDDDD'},
          {name: 'Other', value: '#FB9A99'}
        ];

      var table_name = this.map.get('table_name')
      var field_name = this.get('field_name')
      var baseCSS = this.get('baseCSS')

      var typeCSS = typeBuckets.map(function(bucket){
        return "#" + table_name + "[" + field_name + "='" + bucket.name + "']{marker-fill:" + bucket.value + ";}";
      }, this);

      return '#' + table_name + baseCSS.join(['\n']) +'\n' + typeCSS.join(['\n']);

    }

  });

  return LayerModel;

});
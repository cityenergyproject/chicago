define([
  'underscore',
  'backbone',
  'd3',
], function(_, Backbone) {

  var LayerModel = Backbone.Model.extend({

    defaults : {
        
        baseCSS : [
            '{marker-fill: #CCC;',
            'marker-fill-opacity: 0.9;',
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

    cartoCSS: function(){
      var min = this.get('min');
      var max = this.get('max');
      var range_step = (max - min) / this.get('range_slice_count');
      var bucket_steps = _.range(max, min, -(range_step));

      var colorScale = d3.scale.linear()
        .range(this.get('color_range'))
        .domain([min, max]);

      
      var table_name = this.get('table_name');
      var field_name = this.get('field_name');
      var baseCSS = this.get('baseCSS');

      var dataCSS = bucket_steps.map(function(bucket){
        return "#" + table_name + "[" + field_name + "<=" + bucket + "]{marker-fill:" + colorScale(bucket) + ";}";
      }, this);

      return '#' + table_name + baseCSS.join(['\n']) +'\n' + dataCSS.join(['\n']);

    }

  });

  return LayerModel;

});
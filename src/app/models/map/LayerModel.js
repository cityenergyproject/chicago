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
      var range_slice_count = this.get('range_slice_count');
      var table_name = this.get('table_name');
      var field_name = this.get('field_name');
      var baseCSS = this.get('baseCSS');
      var dataCSS = [];

      var colorScale = d3.scale.linear()
        .range(this.get('color_range')) //figure out how to do scales with more than 2 colors
        .domain([0, range_slice_count]);

      var colorRampValues = _.range(this.get('range_slice_count'))
        .map(function(value){
          return colorScale(value);
        });

      // may want to put a linear option in LayerModel, will need to rework this if so
      if (this.get('data')){
        var colorMap = d3.scale.quantile()
          .domain(d3.values(this.get('data')))
          .range(colorRampValues);

        dataCSS = colorRampValues.map(function(color){
          return "#" + table_name + "[" + field_name + ">=" + colorMap.invertExtent(color)[1] + "]{marker-fill:" + color + ";}";
        }, this);
      }
      return '#' + table_name + baseCSS.join(['\n']) +'\n' + dataCSS.join(['\n']);

    },

    distributionData: function(slices){
      if (this.get('data') === undefined) {return undefined;}

      var data = this.get('data');
      var binMap = d3.scale.linear()
          .domain(d3.extent(data))
          .rangeRound([0, slices]);

      var counts = Array.apply(null, Array(slices+1)).map(Number.prototype.valueOf,0);

      _.each(data, function(value){
        if (value === null) {return;}
        var bin = binMap(value);
        counts[bin] += 1;
      });
      return counts;
    },

  });

  return LayerModel;

});
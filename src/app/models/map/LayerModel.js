define([
  'underscore',
  'backbone',
  'd3',
], function(_, Backbone, d3) {

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

    initialize: function(){
      this.empty = true;
      this.setColorRampValues();
      this.on('change:data', this.setDataFields);
    },

    setDataFields: function(){
      var extent;
      var data = this.get('data');

      if (_.every(data, function(d){return d===undefined;})){
        this.empty = true;
        data_extent = undefined;
      } else {
        this.empty = false;

        var data_extent = d3.extent(data);

        if (this.get('filter_range')!==undefined){
          extent = [this.get('filter_range').min, this.get('filter_range').max];
          if (extent[0]===undefined){extent[0] = data_extent[0];}
          if (extent[1]===undefined){extent[1] = data_extent[1];}

        } else {
          extent = data_extent;
        }
      }

      this.set({extent: extent});
      this.trigger('dataReady');
    },

    getFilter: function(){
      var filter = this.get('filter');
      if (filter === undefined){
        filter = this.get('extent');
      }
      return filter;
    },
    filterSQL: function(){
      return this.get('field_name') + " BETWEEN " + this.get('filter').join(' AND ');
    },

    cartoProperties: function(){
      var base_sql = "SELECT * FROM " + this.get('table_name');
      
      var filtersSQL = this.collection.filtersSQL();
      var sql = base_sql + ((filtersSQL == '') ? "" : " WHERE " + filtersSQL);
      return {
          sql: sql,
          cartocss: this.cartoCSS(),
          interactivity: this.collection.interactivity()
        };
    },

    cartoCSS: function(){
      var table_name = this.get('table_name');
      var field_name = this.get('field_name');
      var baseCSS = this.get('baseCSS');
      var dataCSS = [];
      var self = this;

      // may want to put a linear option in LayerModel, will need to rework this if so
      if (this.get('data')){
        dataCSS = this.colorRampValues.map(function(color){
          return "#" + table_name + "[" + field_name + ">=" + self.colorMap().invertExtent(color)[1] + "]{marker-fill:" + color + ";}";
        });
      }
      return '#' + table_name + baseCSS.join(['\n']) +'\n' + dataCSS.join(['\n']);

    },

    colorRamp: function(){ 
      return d3.scale.linear()
        .range(this.get('color_range')) //figure out how to do scales with more than 2 colors
        .domain([0, this.get('range_slice_count')]);
    },

    setColorRampValues: function(){
      var self = this;
      var range = Array.apply(null, {length: this.get('range_slice_count')}).map(Number.call, Number);
      this.colorRampValues = range
        .map(function(value){
          return self.colorRamp()(value);
        });
    },

    colorMap: function(){
      return d3.scale.quantile()
        .domain(this.get('data'))
        .range(this.colorRampValues);
    },

    distributionData: function(slices){
      if (this.empty) {return undefined;}
      var self = this;

      var data = this.get('data');
      var extent = this.get('extent');

      var binMap = d3.scale.linear()
          .domain(extent)
          .rangeRound([0, slices-1]);

      var counts = Array.apply(null, Array(slices))
        .map(function(){
          return {count: 0, color: '#CCCCCC'};
        });

      _.each(data, function(value){
        if (value === null) {return;}
        var bin;
        if (value < extent[0]){
          bin = 0;
        } else if (value > extent[1]){
          bin = slices-1;
        } else {
          bin = binMap(value);
        }
        
        var color = self.colorMap()(value);

        if (counts[bin]!==undefined){
          counts[bin].count += 1;
          counts[bin].color = color;
        }
      });
      return counts;
    },

  });

  return LayerModel;

});
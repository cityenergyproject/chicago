define([
  'jquery',
  'underscore',
  'backbone',
], function($, _, Backbone){

  var HistogramView = Backbone.View.extend({
    className: "histogram",

    initialize: function(options){
      this.distribution_data = options.distribution_data;
      this.slices = options.slices;
      this.$container = options.$container;
    },

    render: function(){
      this.$container.html(this.$el);

      var chartData = this.distribution_data;
      var counts = _.pluck(chartData, 'count');

      var padding = parseInt(this.$container.css('padding-left'))+parseInt(this.$container.css('padding-right'))
      var width = this.$container.innerWidth() - padding;
      var height = parseInt(this.$container.css('height'))

      var yScale = d3.scale.linear()
        .domain([0, d3.max(counts)])
        .range([0, height]);

      var xScale = d3.scale.ordinal()
        .domain(d3.range(0, this.slices))
        .rangeBands([0, width]);

      d3.select(this.$container.selector +' .histogram').append('svg')
        .attr('width', width)
        .attr('height', height)
        .style('background', 'transparent')
        .selectAll('rect').data(chartData)
        .enter().append('rect')
          .style({'fill': function(d){
            return d.color;
            }
          })
          .attr('width', xScale.rangeBand() - xScale.rangeBand()/3)
          .attr('stroke-width', xScale.rangeBand()/6)
          .attr('height', function (data) {
              return yScale(data.count);
          })
          .attr('x', function (data, i) {
              return xScale(i);
          })
          .attr('y', function (data) {
              return height - yScale(data.count);
          });
      return this;
    }

  });

  return HistogramView;

});

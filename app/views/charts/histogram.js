define([
  'jquery',
  'underscore',
  'backbone',
], function($, _, Backbone){

  var HistogramView = Backbone.View.extend({
    className: "histogram",

    initialize: function(options){
      this.aspectRatio = options.aspectRatio || 7/1;
      this.height = 100;
      this.width = this.height * this.aspectRatio;
      this.gradients = options.gradients;
      this.slices = options.slices;
      this.chart = d3.select(this.el).append('svg')
                     .attr('viewBox', '0 0 ' + this.width + ' ' + this.height)
                     .style('background', 'transparent')
                     .append('g');
    },

    render: function(){
      var gradients = this.gradients,
          counts = _.pluck(gradients, 'count'),
          height = this.height,
          yScale = d3.scale.linear()
                     .domain([0, d3.max(counts)])
                     .range([0, this.height]),
          xScale = d3.scale.ordinal()
                     .domain(d3.range(0, this.slices))
                     .rangeBands([0, this.width]);

      var bars = this.chart.selectAll("rect")
          .data(this.gradients);

      bars.enter().append('rect')
          .style({fill: function(d){ return d.color; }})
          .attr({
            width: function() { return xScale.rangeBand() - (xScale.rangeBand() / 3); },
            'stroke-width': function() { return xScale.rangeBand() / 6; },
            height: function (data) { return yScale(data.count); },
            x: function (data, i) { return xScale(i); },
            y: function (data) { return height - yScale(data.count); }
          })

      bars.exit().remove();

      this.chart.selectAll('rect')
                .filter(function(bucket, index) { return bucket.current === index; })
                .classed("current", true);

      return this.el;
    }
  });

  return HistogramView;
});

define([
  'jquery',
  'underscore',
  'backbone',
  'models/city/CityModel',
  'models/map/MapModel',
  'models/map/LayerModel',
  'router',
], function($, _, Backbone,CityModel,MapModel,LayerModel,AppRouter){

  var MapControlView = Backbone.View.extend({
    className: "map-control",

    initialize: function(opts){
      this.map = opts.map;
      this.id = "control-"+this.model.cid;
      this.el = "#"+this.id;
      this.$el = $("<div id='"+this.id+"' class='map-control'></div>").appendTo("#map-controls");
      this.delegateEvents(this.events);

      this.listenTo(this.model, 'change:data', this.renderChart);
    },

    render: function(){ 
      $(this.el).html(
        "<p class='show-layer'>"+this.model.get('title')+"</p>"
      );
      this.renderChart();
      return this;
    },

    renderChart: function(){
      if (this.model.get('data') === undefined) {return;}
      var slices = 30;
      var data = this.model.get('data');

      var chartData = this.chartData();

      var height = 75, width = 150;

      var yScale = d3.scale.linear()
        .domain([0, d3.max(chartData)])
        .range([0, height]);
 
      var xScale = d3.scale.ordinal()
        .domain(d3.range(0, slices))
        .rangeBands([0, width]);

      $(this.el).append('<div class="chart"></div>');

      d3.select('#'+this.id+' .chart').append('svg')
        .attr('width', width)
        .attr('height', height)
        .style('background', 'transparent')
        .selectAll('rect').data(chartData)
        .enter().append('rect')
          .style({'fill': '#CCCCCC'})
          .attr('width', xScale.rangeBand())
          .attr('height', function (data) {
              return yScale(data);
          })
          .attr('x', function (data, i) {
              return xScale(i);
          })
          .attr('y', function (data) {
              return height - yScale(data);
          });

      return this;
    },

    chartData: function(){
      var slices = 30;
      var data = this.model.get('data');
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

    events: {
      'click .show-layer' : 'showLayer',
      'click .chart' : 'chartClick'
    },

    showLayer: function(){
      Backbone.history.navigate('los_angeles/' + this.model.get('field_name'), {trigger: true});
    },

    chartClick: function(){
      var data = this.model.get('data');
      var chartData = this.chartData();
      console.log(chartData);
    }



  });

  return MapControlView;

});
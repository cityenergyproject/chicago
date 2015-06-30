define([
  'jquery',
  'underscore',
  'backbone',
  'models/city/CityModel',
  'models/map/MapModel',
  'models/map/LayerModel',
  'text!/app/templates/map_controls/MapControlCategoryTemplate.html'
], function($, _, Backbone,CityModel,MapModel,LayerModel,MapControlCategoryTemplate){

  var MapControlView = Backbone.View.extend({
    className: "map-control",
    $container: $('#map-controls'),

    initialize: function(opts){
      this.map = opts.map;
      this.id = "control-"+this.model.cid;
      this.el = "#"+this.id;
      this.$el = $("<div id='"+this.id+"' class='map-control'></div>").appendTo(this.$category());
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
      // pull this out into a DistributionChartView

       // return if no data, but we are listening for it and will render then
      if (this.model.distributionData(1) === undefined) {return this;}

      // lets not render charts for layers that don't have categories
      if (this.model.get('category') === undefined) {return this;}


      var slices = 50;
      var chartData = this.model.distributionData(slices);
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

    events: {
      'click .show-layer' : 'showLayer',
      'click .chart' : 'chartClick'
    },

    showLayer: function(){
      Backbone.history.navigate('los_angeles/' + this.model.get('field_name'), {trigger: true});
    },

    chartClick: function(){
      var chartData = this.model.distributionData(50);
      console.log(chartData);
    },

    $category: function(){
      var category_name = this.model.get('category');

      var c,
      $other = this.$container.find( $("#category-other") );

      if (category_name === undefined){ //put it in other
        if ($other.length > 0){ return c === $other; }
        c = $(_.template(MapControlCategoryTemplate)({category: 'Other'})).appendTo(this.$container);
        
      }else{
        var category_id = "#category-"+category_name.toLowerCase().replace(' ', '-');
        c = this.$container.find( $(category_id) );
      }
      if (c.length > 0){return c;} 

      // // create a new category
      // var new_category = _.template(MapControlCategoryTemplate)({category: category_name});

      // // put it before other if there is one
      // if ($other.length > 0){
      //   return $(new_category).insertBefore($other);
      // }else{
      //   return $(new_category).appendTo(this.$container);
      // }
      // // TODO: refactor this method - such ugly
    }


  });

  return MapControlView;

});
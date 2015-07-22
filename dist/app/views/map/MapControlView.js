define([
  'jquery',
  'underscore',
  'backbone',
  'ionrangeslider',
  'models/city/CityModel',
  'models/map/MapModel',
  'models/map/LayerModel',
  'text!/app/templates/map_controls/MapControlCategoryTemplate.html',
  'text!/app/templates/map_controls/MapControlFilterTemplate.html',
    'text!/app/templates/map_controls/MapControlTemplate.html'
], function($, _, Backbone,Ion,CityModel,MapModel,LayerModel,MapControlCategoryTemplate, MapControlFilterTemplate, MapControlTemplate){

  var MapControlView = Backbone.View.extend({
    className: "map-control",
    $container: $('#map-controls'),

    initialize: function(opts){
      this.map = opts.map;
      this.id = "control-"+this.model.cid;
      this.el = "#"+this.id;
      this.$el = $("<div id='"+this.id+"' class='map-control'></div>").appendTo(this.$category());

      this.delegateEvents(this.events);

      this.listenTo(this.model, 'dataReady', this.update);
      this.listenTo(this.map, 'change:current_layer', this.setCurrentLayerProperties);
    },

    render: function(){ 
      var template = _.template(MapControlTemplate);
      $(this.el).html(
        template(this.model)
      );
      this.update();
      return this;
    },

    update: function(){
      this.setCurrentLayerProperties();
      if (this.model.get('display_type')=='range'){
        this.renderChart();
        this.renderFilter();
      }
      
    },

    renderChart: function(){
      // pull this out into a DistributionChartView

       // return if no data, but we are listening for it and will render then
      if (this.model.get('data') === undefined) {return this;}

      // lets not render charts for layers that don't have categories
      if (this.model.get('category') === undefined) {return this;}

      var slices = 18;
      var chartData = this.model.distributionData(slices);
      var counts = _.pluck(chartData, 'count');

      var padding = 30;
      var width = this.$el.parent().innerWidth() - padding*2;
      var height = 75

      var yScale = d3.scale.linear()
        .domain([0, d3.max(counts)])
        .range([0, height]);
 
      var xScale = d3.scale.ordinal()
        .domain(d3.range(0, slices))
        .rangeBands([0, width]);

      d3.select('#'+this.id+' .chart').append('svg')
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
    },

    renderFilter: function(){
      if (this.model.get('data') === undefined) {return this;}
      if (this.model.get('category') === undefined) {return this;}

      var self = this;
      var data = this.model.get('data');
      var template = _.template(MapControlFilterTemplate);
      var filter = $(template({id: this.model.cid})).appendTo($(this.el + ' .filter-wrapper'))

      var extent = this.model.get('extent');
      var from_to = this.model.getFilter();

      var from_min = null, to_max = null;
      if (this.model.get('filter_range')){
        from_min = this.model.get('filter_range').min || null;
        to_max = this.model.get('filter_range').max || null;
      }

      filter.ionRangeSlider({
        type: 'double',
        min: extent[0],
        max: extent[1],
        from: from_to[0],
        to: from_to[1],
        hide_from_to: false,
        force_edges: true,
        grid: false,
        hide_min_max: true,
        from_min: from_min,
        to_max: to_max,
        prettify_enabled: true,
        prettify: function (num) {
          if (num == this.to_max) {
            return num + "+";
          } else if (num == this.from_min) {
            return num + "-";
          } else {
            return num;
          }
          
        },
        onFinish: function(filterControl){
          if (filterControl.from == filterControl.min && filterControl.to == filterControl.max){
            self.model.set('filter', undefined);
          }else{
            self.model.set('filter', [filterControl.from, filterControl.to]);
          }
        }

      
      });
      return this;
    },

    setCurrentLayerProperties: function(){
      if (this.model.get('data') === undefined) {return this;}
      if (this.model==this.map.getCurrentLayer()){
        $(this.el).addClass('current');
      }else{
        $(this.el).removeClass('current');
      }

    },

    events: {
      'click .category' : 'toggleCategory',
      'click .show-layer' : 'showLayer',
      'click .more-info': 'toggleMoreInfo',
      'click .chart' : 'chartClick'
    },

    showLayer: function(event){
      Backbone.history.navigate(this.map.get('city').get('url_name') + '/' + this.model.get('field_name'), {trigger: true});
    },

    chartClick: function(){
      var chartData = this.model.distributionData(50);
      console.log(chartData);
    },

    toggleMoreInfo: function(){
      this.$el.toggleClass('more-info');
      return this;
    },

    $category: function(){
      var category_name = this.model.get('category');

      var c,
      $other = this.$container.find( $("#category-other") );

      if (category_name === undefined){ //put it in other
        if ($other.length > 0){ return c === $other; }
        c = $(_.template(MapControlCategoryTemplate)({category: 'Other'})).appendTo(this.$container);
        
      }else{
        var category_id = "#category-"+category_name.toLowerCase().replace(/\s/g, "-");
        c = this.$container.find( $(category_id) );
      }
      if (c.length > 0){return c;} 

      // create a new category
      var new_category = _.template(MapControlCategoryTemplate)({category: category_name});

      // put it before other if there is one
      if ($other.length > 0){
        return $(new_category).insertBefore($other);
      }else{
        return $(new_category).appendTo(this.$container);
      }
      // TODO: refactor this method - such ugly
    }


  });

  return MapControlView;

});
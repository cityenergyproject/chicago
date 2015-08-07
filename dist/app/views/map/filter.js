define([
  'jquery',
  'underscore',
  'backbone',
  'ionrangeslider',
  'models/building_bucket_calculator',
  'models/building_color_bucket_calculator',
  'views/charts/histogram',
  'text!/app/templates/map_controls/filter_section_header.html',
  'text!/app/templates/map_controls/filter.html',
  'text!/app/templates/map_controls/filter_container.html'
], function($, _, Backbone, Ion, BuildingBucketCalculator, BuildingColorBucketCalculator, HistogramView, FilterSectionHeader, FilterTemplate, FilterContainer){

  var MapControlView = Backbone.View.extend({
    className: "map-control",
    $container: $('#map-controls'),

    initialize: function(options){
      this.layer = options.layer;
      this.allBuildings = options.allBuildings;
      this.state = options.state;
      this.listenTo(this.state, 'change:url_name', this.onDataSourceChange);
      this.listenTo(this.state, 'change:year', this.onDataSourceChange);
      this.listenTo(this.state, 'change:layer', this.onLayerChange);
    },

    onDataSourceChange: function(){
      this.$container.empty();
    },

    onLayerChange: function(){
      var fieldName = this.layer.field_name,
          currentLayer = this.state.get('layer'),
          isCurrent = currentLayer == fieldName;
      this.$el.toggleClass('current', isCurrent);
      this.$section().toggleClass('current', this.$section().find('.current').length > 0);
    },

    render: function(){
      var template = _.template(FilterContainer),
          fieldName = this.layer.field_name,
          $el = $('#' + fieldName),
          currentLayer = this.state.get('layer'),
          isCurrent = currentLayer == fieldName,
          $section = this.$section();

      if ($el.length == 0) {
        this.$el.html(template(_.defaults(this.layer, {description: null})));
        this.$el.attr("id", this.layer.field_name);
      } else {
        this.$el = $el;
      }
      $el.toggleClass('current', isCurrent);
      $section.toggleClass('expand', $section.find('.current').length > 0);
      $section.toggleClass('current', $section.find('.current').length > 0);
      this.$el.appendTo($section);

      var container = $("#" + this.layer.field_name + " .chart"),
          filterRange = this.layer.filter_range,
          fieldName = this.layer.field_name,
          rangeSliceCount = this.layer.range_slice_count,
          colorStops = this.layer.color_range,
          buildings = this.allBuildings,
          bucketCalculator = new BuildingBucketCalculator(buildings, fieldName, rangeSliceCount, filterRange),
          gradientCalculator = new BuildingColorBucketCalculator(buildings, fieldName, rangeSliceCount, colorStops),
          buckets = bucketCalculator.toBuckets(),
          gradient = gradientCalculator.toGradientStops();

      var filterData = _.map(gradient, function(stop, bucketIndex){
        return {
          color: stop,
          count: buckets[bucketIndex] || 0
        };
      });

      var histogram = new HistogramView({
        distribution_data: filterData,
        $container: container,
        slices: rangeSliceCount
      });

      histogram.render();

      var filterTemplate = _.template(FilterTemplate);
      var $filter = this.$el.find('.filter-wrapper').html(filterTemplate({id: fieldName}));
      var from_min = null, from_max = null;
      var extent = bucketCalculator.toExtent();

      $filter.ionRangeSlider({
        type: 'double',
        min: extent[0],
        max: extent[1],
        from: extent[0],
        to: extent[1],
        hide_from_to: false,
        force_edges: true,
        grid: false,
        hide_min_max: true,
        from_min: extent[0],
        to_max: extent[1],
        prettify_enabled: true,
        prettify: this.onPrettifyHandler(extent[0], extent[1]),
        onFinish: _.bind(this.onFilterFinish, this)
      });

      return this;
    },

    onFilterFinish: function(rangeSlider) {
      var filters = this.state.get('filters'),
          fieldName = this.layer.field_name;
      delete filters[fieldName];

      if (rangeSlider.from !== rangeSlider.min || rangeSlider.to !== rangeSlider.max){
        filters[fieldName] = [rangeSlider.from, rangeSlider.to];
      }

      this.state.set({filters: filters});
    },

    onPrettifyHandler: function(min, max) {
      return function(num) {
        switch(num) {
          case min: return num + "+";
          case max: return num + "-";
          default: return num;
        }
      };
    },

    events: {
      'click' : 'showLayer',
      'click .more-info': 'toggleMoreInfo',
    },

    showLayer: function(){
      this.state.set({layer: this.layer.field_name});
    },

    toggleMoreInfo: function(){
      this.$el.toggleClass('show-more-info');
      return this;
    },

    $section: function(){
      var sectionName = this.layer.section,
          safeSectionName = sectionName.toLowerCase().replace(/\s/g, "-"),
          sectionId = "#category-" + safeSectionName,
          $sectionEl = $(sectionId),
          template = _.template(FilterSectionHeader);

      if ($sectionEl.length > 0){ return $sectionEl; }

      $sectionEl = $(template({category: sectionName})).appendTo(this.$container);

      $sectionEl.on('click', 'h2', function(event){
        $(event.delegateTarget).toggleClass('expand')
      });

      return $sectionEl;
    }
  });

  return MapControlView;

});

define([
  'jquery',
  'underscore',
  'backbone',
  'ionrangeslider',
  'models/building_bucket_calculator',
  'models/building_color_bucket_calculator',
  'views/charts/histogram',
  'text!templates/map_controls/filter_section_header.html',
  'text!templates/map_controls/filter.html',
  'text!templates/map_controls/filter_container.html'
], function($, _, Backbone, Ion, BuildingBucketCalculator, BuildingColorBucketCalculator, HistogramView, FilterSectionHeader, FilterTemplate, FilterContainer){

  var MapControlView = Backbone.View.extend({
    className: "map-control",
    $container: $('#map-controls'),

    initialize: function(options){
      this.layer = options.layer;
      this.allBuildings = options.allBuildings;
      this.state = options.state;
      this.listenTo(this.state, 'change:layer', this.onLayerChange);
      this.listenTo(this.state, 'change:filters', this.render);
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
          safeFieldName = fieldName.toLowerCase().replace(/\s/g, "-"),
          $el = $('#' + safeFieldName),
          currentLayer = this.state.get('layer'),
          isCurrent = currentLayer == fieldName,
          $section = this.$section(),
          filterRange = this.layer.filter_range,
          rangeSliceCount = this.layer.range_slice_count,
          colorStops = this.layer.color_range,
          buildings = this.allBuildings,
          bucketCalculator = new BuildingBucketCalculator(buildings, fieldName, rangeSliceCount, filterRange),
          extent = bucketCalculator.toExtent(),
          gradientCalculator = new BuildingColorBucketCalculator(buildings, fieldName, rangeSliceCount, colorStops),
          buckets = bucketCalculator.toBuckets(),
          gradientStops = gradientCalculator.toGradientStops(),
          histogram, $filter,
          filterTemplate = _.template(FilterTemplate),
          stateFilters = this.state.get('filters'),
          filterState = _.findWhere(stateFilters, {field: fieldName}) || {min: extent[0], max: extent[1]},
          filterRangeMin = (filterRange || {}).min,
          filterRangeMax = (filterRange || {}).max;

      var bucketGradients = _.map(gradientStops, function(stop, bucketIndex){
        return {
          color: stop,
          count: buckets[bucketIndex] || 0
        };
      });

      if ($el.length === 0) {
        this.$el.html(template(_.defaults(this.layer, {description: null})));
        this.$el.find('.filter-wrapper').html(filterTemplate({id: fieldName}));
        this.$el.attr('id', safeFieldName);
      } else {
        this.$el = $el;
      }

      if (!this.$filter) {
        this.$slider = this.$el.find('.filter-wrapper').ionRangeSlider({
          type: 'double',
          hide_from_to: false,
          force_edges: true,
          grid: false,
          hide_min_max: true,
          prettify_enabled: !fieldName.match(/year/),
          prettify: this.onPrettifyHandler(filterRangeMin, filterRangeMax),
          onFinish: _.bind(this.onFilterFinish, this),
        });
        this.$filter = this.$slider.data("ionRangeSlider");
      }

      this.$filter.update({
        min: extent[0],
        max: extent[1],
        from: filterState.min,
        to: filterState.max,
        from_min: filterRangeMin,
        to_max: filterRangeMax
      });

      if (!this.histogram) {
        this.histogram = new HistogramView({gradients: bucketGradients, slices: rangeSliceCount});
      }
      this.$el.find('.chart').html(this.histogram.render())

      this.$el.toggleClass('current', isCurrent);
      if(isCurrent || $section.find('.current').length > 0) { $section.find('input').prop('checked', true); }
      $section.toggleClass('current', isCurrent || $section.find('.current').length > 0);
      $section.find('.category-control-container').append(this.$el);

      return this;
    },
    onFilterFinish: function(rangeSlider) {
      var filters = this.state.get('filters'),
          fieldName = this.layer.field_name;
      filters = _.reject(filters, function(f){ return f.field == fieldName; })

      if (rangeSlider.from !== rangeSlider.min || rangeSlider.to !== rangeSlider.max){
        filters.push({field: fieldName, min: rangeSlider.from, max: rangeSlider.to});
      }

      this.state.set({filters: filters})
    },

    onPrettifyHandler: function(min, max) {
      return function(num) {
        switch(num) {
          case min: return num.toLocaleString();
          case max: return num.toLocaleString() + "+";
          default: return num.toLocaleString();
        }
      };
    },

    events: {
      'click' : 'showLayer',
      'click .more-info': 'toggleMoreInfo',
    },

    showLayer: function(){
      var fieldName = this.layer.field_name;
      this.state.set({layer: fieldName, sort: fieldName, order: 'desc'});
    },

    toggleMoreInfo: function(){
      this.$el.toggleClass('show-more-info');
      return this;
    },

    $section: function(){
      var sectionName = this.layer.section,
          safeSectionName = sectionName.toLowerCase().replace(/\s/g, "-"),
          $sectionEl = $("#" + safeSectionName),
        template = _.template(FilterSectionHeader);

      if ($sectionEl.length > 0){ return $sectionEl; }

      $sectionEl = $(template({category: sectionName})).appendTo(this.$container);

      return $sectionEl;
    }
  });

  return MapControlView;

});

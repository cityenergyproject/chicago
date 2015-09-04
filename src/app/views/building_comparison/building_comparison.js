define([
  'jquery',
  'underscore',
  'backbone',
  'models/building_comparator',
  'models/building_color_bucket_calculator',
  'models/building_bucket_calculator',
  'views/charts/histogram',
  'text!templates/building_comparison/table_head.html',
  'text!templates/building_comparison/table_body.html'
], function($, _, Backbone, BuildingComparator, BuildingColorBucketCalculator, BuildingBucketCalculator, HistogramView, TableHeadTemplate,TableBodyRowsTemplate){

  var ReportTranslator = function(buildingId, buildingFields, metricFields, buildings, gradientCalculators) {
    this.buildingId = buildingId;
    this.buildingFields = buildingFields;
    this.metricFields = metricFields;
    this.buildings = buildings;
    this.gradientCalculators = gradientCalculators;
  };

  ReportTranslator.prototype.toBuildingRow = function(building) {
    var result = {
      id: building.get(this.buildingId),
      fields: _.values(building.pick(this.buildingFields)),
      metrics: _.map(this.metricFields, function(field) {
        var value = building.get(field),
            color = this.gradientCalculators[field].toColor(value);
        return {
          value: value,
          color: color,
          undefined: (value ? 'defined' : 'undefined')
        };
      }, this)
    };
    return result;
  };

  ReportTranslator.prototype.toBuildingReport = function() {
    return this.buildings.map(this.toBuildingRow, this);
  };

  var MetricAverageCalculator = function(buildings, fields, gradientCalculators){
    this.buildings = buildings;
    this.fields = fields;
    this.gradientCalculators = gradientCalculators;
  };

  MetricAverageCalculator.prototype.calculateField = function(field){
    var fieldName = field.field_name,
        values = this.buildings.pluck(fieldName),
        median = Math.round(d3.median(values) * 10) / 10,
        gradientCalculator = this.gradientCalculators[fieldName];
    return _.extend({}, field, {
      median: median,
      color: gradientCalculator.toColor(median)
    });
  };

  MetricAverageCalculator.prototype.calculate = function(){
    return _.map(this.fields, _.bind(this.calculateField, this));
  };

  var BuildingMetricCalculator = function(currentBuilding, buildings, metricFields, gradientCalculators) {
    this.currentBuilding = currentBuilding;
    this.buildings = buildings;
    this.metricFields = metricFields;
    this.gradientCalculators = gradientCalculators;
  }

  BuildingMetricCalculator.prototype.renderField = function(field) {
    var fieldName = field.field_name,
        gradients = this.gradientCalculators[fieldName],
        slices = field.range_slice_count,
        aspectRatio = 4/1;
        gradientStops = gradients.toGradientStops(),
        filterRange = field.filter_range,
        bucketCalculator = new BuildingBucketCalculator(this.buildings, fieldName, slices, filterRange),
        value = this.currentBuilding.get(fieldName),
        currentColor = gradients.toColor(value),
        buckets = bucketCalculator.toBuckets(),
        bucketGradients = _.map(gradientStops, function(stop, bucketIndex){
          return {
            current: _.indexOf(gradientStops, currentColor),
            color: stop,
            count: buckets[bucketIndex] || 0
          };
        }),
        histogram = new HistogramView({gradients: bucketGradients, slices: slices, aspectRatio: aspectRatio});
    return histogram;
  }

  BuildingMetricCalculator.prototype.render = function(rowContainer) {
    rowContainer.find('td.metric').each(_.bind(function(index, cell) {
      var field = this.metricFields[index],
          histogram = this.renderField(field);
      $(cell).find('.histogram').replaceWith(histogram.render())
    }, this))
  }

  var MetricsValidator = function(cityFields, metrics, newField) {
    this.cityFields = cityFields;
    this.metrics = metrics;
    this.newField = newField;
  };

  MetricsValidator.prototype.toValidFields = function(){
    var allValidFields = _.intersection(this.metrics.concat([this.newField]), this.cityFields),
        lastValidField = _.last(allValidFields);
    if (allValidFields.length > 5) {
      allValidFields = _.first(allValidFields,4).concat([lastValidField]);
    }
    return allValidFields;
  };

  var BuildingComparisonView = Backbone.View.extend({
    el: "#buildings",
    metrics: [],
    sortedBy: {},

    initialize: function(options){
      this.state = options.state;
      this.$el.html('<div class="building-report-header-container"><table class="building-report"><thead></thead></table></div><table class="building-report"><tbody></tbody></table>');
      this.allBuildings = this.state.asBuildings();
      this.buildings = this.state.asBuildings();
      this.listenTo(this.allBuildings, 'sync', this.onBuildings, this);
      this.listenTo(this.buildings, 'sort', this.render, this);
      this.listenTo(this.state, 'change:city', this.onDataSourceChange);
      this.listenTo(this.state, 'change:layer', this.onLayerChange);
      this.listenTo(this.state, 'change:metrics', this.onMetricsChange);
      this.listenTo(this.state, 'change:sort', this.onSort);
      this.listenTo(this.state, 'change:order', this.onSort);
      this.listenTo(this.state, 'change:building', this.render);
      $(window).scroll(_.bind(this.onScroll, this));
    },

    onDataSourceChange: function(){
      _.extend(this.allBuildings, this.state.pick('tableName', 'cartoDbUser'));
      this.allBuildings.fetch();

      _.extend(this.buildings, this.state.pick('tableName', 'cartoDbUser'));
      this.listenTo(this.state, 'change:filters', this.onSearchChange);
      this.listenTo(this.state, 'change:categories', this.onSearchChange);
      this.buildings.fetch(this.state.get('categories'), this.state.get('filters'));
    },

    onBuildings: function(){
      var buildings = this.allBuildings,
          layers = this.state.get('city').get('map_layers'),
          fields = _.where(layers, {display_type: 'range'});
      this.gradientCalculators = _.reduce(fields, function(memo, field){
        memo[field.field_name] = new BuildingColorBucketCalculator(
          buildings,
          field.field_name,
          field.range_slice_count,
          field.color_range
        );
        return memo;
      }, {});
      this.render();
    },

    onSearchChange: function(){
      this.buildings.fetch(this.state.get('categories'), this.state.get('filters'));
    },

    onScroll: function() {
      var $container = this.$el.find('.building-report-header-container'),
          topOfScreen = $(window).scrollTop()
          topOfTable  = $container.offset().top,
          scrolledPastTableHead = topOfScreen > topOfTable;

      $container.toggleClass('fixed', scrolledPastTableHead);
    },

    onLayerChange: function() {
      if(!this.state.get('city')) { return; }

      var metrics = this.state.get('metrics'),
          newLayer = this.state.get('layer'),
          cityFields = _.pluck(this.state.get('city').get('map_layers'), 'field_name'),
          validator = new MetricsValidator(cityFields, metrics, newLayer),
          validMetrics = validator.toValidFields();
      this.state.set({metrics: validMetrics});
      return this;
    },

    render: function(){
      if(!this.state.get('city')) { return; }
      if (!this.gradientCalculators) { return; }
      if (!this.buildings.length > 0) { return; }
      this.onLayerChange();
      this.renderTableHead();
      this.renderTableBody();
      return this;
    },

    renderTableHead: function(){
      var $head = this.$el.find('thead'),
          city = this.state.get('city'),
          currentLayerName = this.state.get('layer'),
          sortColumn = this.state.get('sort'),
          sortOrder = this.state.get('order'),
          mapLayers = city.get('map_layers'),
          currentLayer = _.findWhere(mapLayers, {field_name: currentLayerName}),
          template = _.template(TableHeadTemplate),
          metrics = this.state.get('metrics');

      var metrics = _.chain(metrics)
                     .map(function(m){ return _.findWhere(mapLayers, {field_name: m}); })
                     .map(function(layer){
                      var current = layer.field_name == currentLayerName,
                          sorted = layer.field_name == sortColumn;
                       return _.extend({
                         current: current ? 'current' : '',
                         sorted: sorted ? 'sorted ' + sortOrder : '',
                         checked: current ? 'checked="checked"' : ''
                       }, layer);
                     })
                     .value();

      $head.replaceWith(template({
        metrics: metrics,
        currentLayer: currentLayer
      }));
    },

    renderTableBody: function(){
      var buildings = this.buildings,
          $body = this.$el.find('tbody'),
          buildingFields = _.values(this.state.get('city').pick('property_name', 'building_type')),
          cityFields = this.state.get('city').get('map_layers'),
          buildingId = this.state.get('city').get('property_id'),
          currentBuilding = this.state.get('building') || buildings.first().get(buildingId),
          metricFieldNames = this.state.get('metrics'),
          metricFields = _.map(metricFieldNames, function(name) { return _.findWhere(cityFields, {field_name: name}); })
          template = _.template(TableBodyRowsTemplate),
          report = new ReportTranslator(buildingId, buildingFields, metricFieldNames, buildings, this.gradientCalculators),
          metrics = new MetricAverageCalculator(buildings, metricFields, this.gradientCalculators).calculate(),
          building = buildings.find(function(b) { return b.get(buildingId) == currentBuilding}),
          buildingMetrics = new BuildingMetricCalculator(building, this.allBuildings, metricFields, this.gradientCalculators);

      $body.replaceWith(template({
        currentBuilding: currentBuilding,
        metrics: metrics,
        buildings: report.toBuildingReport()
      }));

      buildingMetrics.render($('tr.current'));
    },

    events: {
      'click .remove' : 'removeMetric',
      'click label' : 'onSortClick',
      'change input' : 'changeActiveMetric',
      'click tbody tr': 'onRowClick'
    },

    onMetricsChange: function(){
      this.render();
    },

    onRowClick: function(event){
      var $target = $(event.target),
          $row = $target.closest('tr'),
          buildingId = $row.attr('id');
      this.state.set({building: buildingId});
    },

    removeMetric: function(event){
      var $target = $(event.target),
          $parent = $target.closest('th'),
          removedField = $parent.find('input').val(),
          sortedField = this.state.get('sort'),
          metrics = this.state.get('metrics');

      if (metrics.length == 1) { return false; }
      if(removedField == sortedField) { sortedField = metrics[0]; }
      metrics = _.without(metrics, removedField);
      this.state.set({metrics: metrics, sort: sortedField});
    },

    changeActiveMetric: function(event) {
      var $target = $(event.target),
          fieldName = $target.val();
      this.state.set({layer: fieldName, sort: fieldName, building: null});
    },

    onSortClick: function(event) {
      var $target = $(event.target);
      var $parent = $target.closest('th');
      var $sortInput = $parent.find('input');
      var sortField = $sortInput.val(),
          sortOrder = this.state.get('order');
      sortOrder = (sortOrder == 'asc') ? 'desc' : 'asc';
      this.state.set({sort: sortField, order: sortOrder, building: null});
    },

    onSort: function() {
      var sortField = this.state.get('sort'),
          sortOrder = this.state.get('order');
      var comparator = new BuildingComparator(sortField, sortOrder == 'asc');
      this.buildings.comparator = _.bind(comparator.compare, comparator);
      this.buildings.sort();
    }
  });

  return BuildingComparisonView;

});

define([
  'jquery',
  'underscore',
  'backbone',
  'models/building_comparator',
  'models/building_color_bucket_calculator',
  'text!/app/templates/building_comparison/table_head.html',
  'text!/app/templates/building_comparison/table_body.html'
], function($, _, Backbone, BuildingComparator, BuildingColorBucketCalculator, TableHeadTemplate,TableBodyRowsTemplate){

  var ReportTranslator = function(buildingId, buildingFields, metricFields, buildings) {
    this.buildingId = buildingId;
    this.buildingFields = buildingFields;
    this.metricFields = metricFields;
    this.buildings = buildings;
  };

  ReportTranslator.prototype.toBuildingRow = function(building) {
    var result = {
      id: building.get(this.buildingId),
      fields: _.values(building.pick(this.buildingFields)),
      metrics: building.pick(this.metricFields)
    };
    return result;
  };

  ReportTranslator.prototype.toBuildingReport = function() {
    return this.buildings.map(this.toBuildingRow, this);
  };

  var BuildingComparisonView = Backbone.View.extend({
    el: "#buildings",
    metrics: [],
    sortedBy: {},

    initialize: function(options){
      this.state = options.state;
      this.$el.html('<table class="building-report"><thead></thead><tbody></tbody></table>');
      this.buildings = this.state.asBuildings();
      this.listenTo(this.buildings, 'sync', this.render, this);
      this.listenTo(this.buildings, 'sort', this.render, this);
      this.listenTo(this.state, 'change:city', this.onDataSourceChange);
      this.listenTo(this.state, 'change:layer', this.onLayerChange);
      this.listenTo(this.state, 'change:metrics', this.onMetricsChange);
      this.listenTo(this.state, 'change:sort', this.onSort);
      this.listenTo(this.state, 'change:order', this.onSort);
      this.listenTo(this.state, 'change:building', this.render);
    },

    onDataSourceChange: function(){
      _.extend(this.buildings, this.state.pick('tableName', 'cartoDbUser'));
      this.listenTo(this.state, 'change:filters', this.onSearchChange);
      this.listenTo(this.state, 'change:categories', this.onSearchChange);
      this.buildings.fetch(this.state.get('categories'), this.state.get('filters'));
    },

    onSearchChange: function(){
      this.buildings.fetch(this.state.get('categories'), this.state.get('filters'));
    },

    onLayerChange: function() {
      var metrics = this.state.get('metrics'),
          newLayer = this.state.get('layer');
      if (_.contains(metrics, newLayer)) {return this;}
      if (metrics.length < 5) {
        this.state.set({metrics: metrics.concat([newLayer])});
      }else{
        metrics[4] = newLayer;
        this.state.set({metrics: metrics});
      }
      return this;
    },

    render: function(){
      if(!this.state.get('city')) { return; }
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
                       return _.extend({
                         current: layer.field_name == currentLayerName ? 'current' : '',
                         sorted: layer.field_name == sortColumn ? 'sorted ' + sortOrder : '',
                         checked: layer.field_name == currentLayer ? 'checked="checked"' : ''
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
          buildingId = this.state.get('city').get('property_id'),
          currentBuilding = this.state.get('building'),
          metricFields = this.state.get('metrics'),
          template = _.template(TableBodyRowsTemplate),
          report = new ReportTranslator(buildingId, buildingFields, metricFields, buildings);

      $body.replaceWith(template({
        currentBuilding: currentBuilding,
        buildings: report.toBuildingReport()
      }));

      this.highlightCurrentBuildingRow();
    },

    highlightCurrentBuildingRow: function(){
      var buildings = this.buildings,
          buildingId = this.state.get('city').get('property_id'),
          currentBuilding = this.state.get('building'),
          metricFields = this.state.get('metrics'),
          mapLayers = this.state.get('city').get('map_layers'),


      $currentBuildingRow = $('tr.current')
      _.each(metricFields, function(metric){
        var layer = _.findWhere(mapLayers, {field_name: metric}),
            $metricContainer = $currentBuildingRow.find('.' + metric + ' .metric-container')
            value = $metricContainer.find('span').text();
            rangeSliceCount = layer.range_slice_count,
            colorStops = layer.color_range,
            gradientCalculator = new BuildingColorBucketCalculator(buildings, metric, rangeSliceCount, colorStops);

            $metricContainer.css('color', gradientCalculator.toColor(value))
      });

      return this;

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

    onRowClick: function(){
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
      this.state.set({layer: fieldName, sort: fieldName});
    },

    onSortClick: function() {
      var $target = $(event.target);
      var $parent = $target.closest('th');
      var sortField = $parent.find('input').val(),
          sortOrder = this.state.get('order');
      sortOrder = (sortOrder == 'asc') ? 'desc' : 'asc';
      this.state.set({sort: sortField, order: sortOrder});
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

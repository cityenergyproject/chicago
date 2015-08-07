define([
  'jquery',
  'underscore',
  'backbone',
  'models/building_comparator',
  'text!/app/templates/building_comparison/table_head.html',
  'text!/app/templates/building_comparison/table_body.html'
], function($, _, Backbone, BuildingComparator, TableHeadTemplate,TableBodyRowsTemplate){

  var ReportTranslator = function(buildingFields, metricFields, buildings) {
    this.buildingFields = buildingFields;
    this.metricFields = metricFields;
    this.buildings = buildings;
  };

  ReportTranslator.prototype.toBuildingRow = function(building) {
    var result = {
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
    },

    onDataSourceChange: function(){
      _.extend(this.buildings, this.state.pick('tableName', 'cartoDbUser'));
      this.buildings.fetch();
    },

    onLayerChange: function() {
      var metrics = this.state.get('metrics'),
          newLayer = this.state.get('layer');
      if (metrics.length < 5 && !_.contains(metrics, newLayer)) {
        this.state.set({metrics: metrics.concat([newLayer])})
      }
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
          metricFields = this.state.get('metrics'),
          template = _.template(TableBodyRowsTemplate),
          report = new ReportTranslator(buildingFields, metricFields, buildings);

      $body.replaceWith(template({
        buildings: report.toBuildingReport()
      }));
    },

    events: {
      'click .remove' : 'removeMetric',
      'click label' : 'onSortClick',
      'change input' : 'changeActiveMetric'
    },

    onMetricsChange: function(){
      this.render();
    },

    removeMetric: function(event){
      var $target = $(event.target),
          $parent = $target.closest('th'),
          removedField = $parent.find('input').val(),
          sortedField = this.state.get('sort'),
          metrics = this.state.get('metrics');

      if (metrics == [removedField]) { return false; }
      if(removedField == sortedField) { sortedField = metrics[0]; }
      metrics = _.reject(metrics, removedField);
      this.state.set({metrics: metrics, sort: sortedField});
    },

    changeActiveMetric: function(event) {
      var $target = $(event.target);
      this.state.set({layer: $target.val()})
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

define([
  'jquery',
  'underscore',
  'backbone',
  'models/building_comparator',
  'text!/app/templates/building_comparison/TableHeadTemplate.html',
  'text!/app/templates/building_comparison/TableBodyRowsTemplate.html'
], function($, _, Backbone, BuildingComparator, TableHeadTemplate,TableBodyRowsTemplate){

  var ReportTranslator = function(buildingFields, metrics, buildings) {
    this.fields = buildingFields;
    this.metrics = metrics;
    this.buildings = buildings;
  };

  ReportTranslator.prototype.toBuildingRow = function(building) {
    var result = {
      fields: _.values(building.pick(this.fields)),
      metrics: building.pick(this.metrics)
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
      this.map = options.map;
      this.mapView = options.mapView;
      this.listenTo(this.map, 'cityChange', this.initWithCity);
    },

    initWithCity: function(){
      this.city = this.map.get('city');
      this.render();
      this.buildings = this.city.asBuildings();
      this.listenTo(this.buildings, 'sync', this.renderTableBody, this);
      this.listenTo(this.buildings, 'sort', this.renderTableBody, this);
      this.buildings.fetch();

      // this.addMetric();

      // this.listenTo(this.map, 'change:current_layer', this.addMetric);
      // this.listenTo(this.city.layers, 'updateLayers', this.removeEmptyMetrics);

      return this;
    },

    render: function(){
      this.$el.html('<table class="building-report"><thead></thead><tbody></tbody></table>');
      this.renderTableHead();
      return this;
    },

    // addMetric: function(){
    //   var newMetric = this.map.getCurrentLayer();
    //   if (newMetric.get('display_type')==="category"){return this;}

    //   var exists = _.find(this.metrics, function(metric){
    //     return metric.get('field_name') == newMetric.get('field_name');
    //   })

    //   if (exists){return this;}

    //   this.metrics.push(newMetric);

    //   this.render();
    //   return this;
    // },


    renderTableHead: function(){
      var $head = this.$el.find('thead'),
          currentLayer = this.map.get('current_layer'),
          template = _.template(TableHeadTemplate);

      $head.replaceWith(template({
        metrics: this.metrics,
        sortedBy: this.sortedBy,
        currentLayer: currentLayer
      }));
    },

    renderTableBody: function(){
      var results = this.buildings, // result set from sql
          $body = this.$el.find('tbody'),
          currentLayer = this.map.get('current_layer'),
          property_name = this.city.get('property_name'),
          building_type = this.city.get('building_type'),
          buildingFields = [property_name, building_type],
          metrics = _.map(this.metrics, function(m) { return m.get('field_name'); });

      var template = _.template(TableBodyRowsTemplate);
      var report = new ReportTranslator(buildingFields, metrics, results).toBuildingReport();
      $body.replaceWith(template({buildings: report}));

      return this;
    },

    events: {
      'click .remove' : 'removeMetric',
      'click label' : 'sortByMetric',
      'change input' : 'changeActiveMetric'
    },

    removeMetric: function(event){
      var $target = $(event.target);
      var $parent = $target.closest('th');
      var field_name = $parent.find('input').val();
      var potentialMetrics = _.reject(this.metrics, function(metric){
        return metric.get('field_name') == field_name;
      });
      if (potentialMetrics.length == 0) { return false; }
      this.metrics = potentialMetrics;

      if (this.sortedBy.field_name == field_name){
        this.sortedBy = {};
      }
      this.render();
    },

    changeActiveMetric: function(event) {
      var $target = $(event.target);
      var field_name = $target.val();
      var url = this.map.get('city').get('url_name') + '/' + this.map.get('city').get('year') + '/' + field_name;
      Backbone.history.navigate(url, {trigger: true});
    },

    sortByMetric: function(event){
      var $target = $(event.target);
      var $parent = $target.closest('th');
      var field_name = $parent.find('input').val();
      var order = $parent.hasClass('desc') ? 'asc' : 'desc';

      this.$el.find('th').removeClass('sorted asc desc');
      $parent.addClass('sorted ' + order);

      var comparator = new BuildingComparator(field_name, order == 'asc')
      this.buildings.comparator = _.bind(comparator.compare, comparator);
      this.buildings.sort();

      return this;
    },

    removeEmptyMetrics: function(){
      var metrics = _.reject(this.metrics, function(metric){
        return this.city.layers.findWhere({field_name: metric.get('field_name')}).empty
      }, this);

      this.metrics = metrics;
      this.render();
      return this;
    }
  });

  return BuildingComparisonView;

});

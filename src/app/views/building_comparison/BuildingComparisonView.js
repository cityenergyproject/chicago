define([
  'jquery',
  'underscore',
  'backbone',
  'text!/app/templates/building_comparison/TableHeadTemplate.html',
  'text!/app/templates/building_comparison/TableBodyRowsTemplate.html'
], function($, _, Backbone,TableHeadTemplate,TableBodyRowsTemplate){

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

      this.addMetric();
      this.render();

      this.listenTo(this.city, 'change:currentBuildingSet', this.renderTableBody);
      this.listenTo(this.map, 'change:current_layer', this.addMetric);
      this.listenTo(this.city.layers, 'updateLayers', this.removeEmptyMetrics);

      return this;
    },

    render: function(){
      this.$el.html('<table class="building-report"></table>');
      this.renderTableHead();
      this.renderTableBody();
      return this;
    },

    addMetric: function(){
      var newMetric = this.map.getCurrentLayer();
      if (newMetric.get('display_type')==="category"){return this;}

      var exists = _.find(this.metrics, function(metric){
        return metric.get('field_name') == newMetric.get('field_name');
      })

      if (exists){return this;}

      this.metrics.push(newMetric);

      this.render();
      return this;
    },


    renderTableHead: function(){
      var $table = this.$el.find('table');
      var currentLayer = this.map.get('current_layer');
      var template = _.template(TableHeadTemplate);
      var rendered = template({
        metrics: this.metrics,
        sortedBy: this.sortedBy,
        currentLayer: currentLayer
      });

      $table.append(rendered);
    },

    renderTableBody: function(){
      var building_set = this.city.get('currentBuildingSet');
      if (building_set===undefined || building_set.length===0) {return this;}
      if (!_.isEmpty(this.sortedBy) && this.sortedBy != building_set.sortedBy){
        this.city.sortBuildingSetBy(this.sortedBy);
        return this;
      }

      var $table = this.$el.find('table');
      var body = $table.find('tbody');
      if (body.length===0){
        body = $('<tbody></tbody>').appendTo($table);
      }

      var property_name = this.city.get('property_name'),
          building_type = this.city.get('building_type');

      var template = _.template(TableBodyRowsTemplate);
      $(body).html(template({buildings: building_set, metrics: this.metrics, building_info_fields: [property_name, building_type]}));

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

      this.sortedBy = {field_name: field_name, order: order};

      this.$el.find('th').removeClass('sorted asc desc');
      $parent.addClass('sorted ' + order);

      this.city.sortBuildingSetBy(this.sortedBy);

      return this;
    },

    changeCity: function(){
      this.el.empty();
      alert('change city');
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

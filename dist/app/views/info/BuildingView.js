define([
  'jquery',
  'underscore',
  'backbone',
  'text!/app/templates/building_comparison/TableHeadTemplate.html',
  'text!/app/templates/building_comparison/TableBodyRowsTemplate.html'
], function($, _, Backbone,TableHeadTemplate,TableBodyRowsTemplate){

  var BuildingView = Backbone.View.extend({
    el: "#buildings",
    metrics: [undefined,undefined,undefined,undefined,undefined],
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

      return this;
    },

    render: function(){ 
      this.$el.html("<table></table");
      this.renderTableHead();
      this.renderTableBody();
      return this;
    },

    addMetric: function(){
      var newMetric = this.map.getCurrentLayer();
      if (newMetric.get('display_type')==="category" || _.contains(this.metrics, newMetric)){return this;}

      var open_metric = _.indexOf(this.metrics, undefined)
      if (open_metric > -1){
        this.metrics[open_metric] = newMetric;
      } else {
        this.metrics[4] = newMetric;
      }
      
      this.render();
      return this;
    },


    renderTableHead: function(){
      var $table = this.$el.find('table');
      var template = _.template(TableHeadTemplate);

      $(template({metrics: this.metrics, sortedBy: this.sortedBy}))
      .appendTo($table);

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
      
      var building_info_fields = this.city.get('building_info_fields');

      var template = _.template(TableBodyRowsTemplate);
      $(body).html(template({buildings: building_set.slice(0,50), metrics: this.metrics, building_info_fields: building_info_fields}));

      return this;
    },

    events: {
      'click .remove' : 'removeMetric',
      'click .metric' : 'sortByMetric'
    },

    removeMetric: function(event){
      var field_name = $(event.target).attr('data-field');
      this.metrics = _.reject(this.metrics, function(metric){
        if (metric===undefined){return false;}
        return metric.get('field_name') == field_name;
      });
      if (this.sortedBy.field_name == field_name){
        this.sortedBy = {};
        // this.city.sortBuildingSetBy(field_name, order); //pass it nil or sort to something else or do nothing?
      }
      event.stopPropagation();
      this.render();
    },

    sortByMetric: function(event){
      
      var $target = $(event.currentTarget);

      var order = $target.hasClass('desc') ? 'asc' : 'desc';
      var field_name = $target.attr('data-field');

      this.sortedBy = {field_name: field_name, order: order};
      $('.metric').removeClass('asc desc');
      $target.addClass(order);
      
      this.city.sortBuildingSetBy(this.sortedBy);

      return this;
      
    },




    changeCity: function(){

      el.empty();
      alert('change city');
      // todo: other cleanup here
    }



  });

  return BuildingView;

});
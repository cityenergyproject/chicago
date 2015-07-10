define([
  'jquery',
  'underscore',
  'backbone',
  'text!/app/templates/building_comparison/TableHeadTemplate.html',
  'text!/app/templates/building_comparison/TableBodyRowsTemplate.html'
], function($, _, Backbone,TableHeadTemplate,TableBodyRowsTemplate){

  var BuildingView = Backbone.View.extend({
    el: "#buildings",

    initialize: function(options){
      this.map = options.map;    
      this.mapView = options.mapView;

      this.listenTo(this.map, 'cityChange', this.initWithCity);
    },

    initWithCity: function(){
      this.city = this.map.get('city');
      
      this.metrics = [this.map.getCurrentLayer()];
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
      if (_.contains(this.metrics, newMetric)){return this;}
      if (this.metrics.length === 5){
        this.metrics[4] = newMetric;
      } else {
        this.metrics.push(newMetric);
      }
      
      this.render();
      return this;
    },


    renderTableHead: function(){
      var $table = this.$el.find('table');
      var template = _.template(TableHeadTemplate);

      $(template({metrics: this.metrics}))
      .appendTo($table);

    },

    renderTableBody: function(){
      var building_set = this.city.get('currentBuildingSet');
      if (building_set===undefined || building_set.length===0) {return this;}

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
      'click .remove' : 'removeMetric'
    },

    removeMetric: function(event){
      var field_name = $(event.target).attr('data-field');
      this.metrics = _.reject(this.metrics, function(metric){
        return metric.get('field_name') == field_name;
      });
      this.render();
    },




    changeCity: function(){

      el.empty();
      alert('change city');
      // todo: other cleanup here
    }



  });

  return BuildingView;

});
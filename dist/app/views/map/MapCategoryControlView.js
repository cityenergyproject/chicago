define([
  'jquery',
  'underscore',
  'backbone',
  'ionrangeslider',
  'models/city/CityModel',
  'models/map/MapModel',
  'models/map/LayerModel',
  'text!/app/templates/map_controls/MapCategoryControlTemplate.html',
], function($, _, Backbone,Ion,CityModel,MapModel,LayerModel,MapCategoryControlTemplate){

  var MapCategoryControlView = Backbone.View.extend({
    $container: $('#map-category-controls'),

    initialize: function(options){
      this.layer = options.layer;
      this.allBuildings = options.allBuildings;
      this.state = options.state;
    },

    render: function(){
      var template = _.template(MapCategoryControlTemplate);
      var compiled = template({
        id: this.layer.field_name,
        title: this.layer.title,
        categories: this.allBuildings.countBy(this.layer.field_name)
      });

      if (this.$el.children().length > 0) {
        this.$el.replaceWith(compiled);
      } else {
        this.$el = $(compiled).appendTo(this.$container);
        this.delegateEvents();
      }

      return this;
    },

    events: {
      'change .categories input' : 'toggleCategory'
    },

    toggleCategory: function(){
      var unchecked = this.$el.find("input:not(:checked)").map(function(){return $(this).val();});
      var checked = this.$el.find("input:checked").map(function(){return $(this).val();});
      if (_.contains(checked, "Other")){
        this.state.set(this.layer.field_name, {values: unchecked.toArray(), other: true});
      } else {
        this.state.set(this.layer.field_name, {values: checked.toArray(), other: false});
      }
    }
  });

  return MapCategoryControlView;

});

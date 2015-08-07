define([
  'jquery',
  'underscore',
  'backbone',
  'ionrangeslider',
  'models/city',
  'text!/app/templates/map_controls/category.html',
], function($, _, Backbone, Ion, CityModel, MapCategoryControlTemplate){

  var MapCategoryControlView = Backbone.View.extend({
    $container: $('#map-category-controls'),

    initialize: function(options){
      this.layer = options.layer;
      this.allBuildings = options.allBuildings;
      this.state = options.state;
    },

    render: function(){
      var counts = this.allBuildings.countBy(this.layer.field_name);
      var template = _.template(MapCategoryControlTemplate);

      if (_.keys(counts)[0] == "undefined") { return this; }

      var compiled = template({
        id: this.layer.field_name,
        title: this.layer.title,
        categories: counts
      });

      this.$el = $(compiled).appendTo(this.$container);
      this.delegateEvents();

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

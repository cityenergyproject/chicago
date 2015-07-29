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

    initialize: function(opts){
      this.map = opts.map;
      this.listenTo(this.model, 'dataReady', this.update);
    },

    render: function(){
      if (this.model.empty){return this;}
      var displayed_categories = this.model.displayedCategories;
      displayed_categories.push({name: "Other", color: "#CCCCCC"});

      var template = _.template(MapCategoryControlTemplate);
      var compiled = template({
        id: this.model.cid,
        title: this.model.get("title"),
        categories: displayed_categories
      });

      if (this.$el.children().length > 0) {
        this.$el.replaceWith(compiled);
      } else {
        this.$el = this.$container.append(compiled);
      }

      return this;
    },

    events: {
      'change input.category.filter' : 'toggleCategory'
    },

    toggleCategory: function(){
      var unchecked = this.$el.find("input:not(:checked)").map(function(){return $(this).val();});
      if (unchecked.length===0){
        return this.model.set('filter', undefined);
      }
      var checked = this.$el.find("input:checked").map(function(){return $(this).val();});
      if (_.contains(checked, "Other")){

        this.model.set('filter', {exclude: unchecked.toArray()});
      } else {
        this.model.set('filter', {include: checked.toArray()});
      }

    }

  });

  return MapCategoryControlView;

});

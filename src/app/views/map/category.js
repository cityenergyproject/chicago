define([
  'jquery',
  'underscore',
  'backbone',
  'ionrangeslider',
  'models/city',
  'text!templates/map_controls/category.html',
], function($, _, Backbone, Ion, CityModel, MapCategoryControlTemplate){

  var MapCategoryControlView = Backbone.View.extend({
    $container: $('#map-category-controls'),

    initialize: function(options){
      this.layer = options.layer;
      this.allBuildings = options.allBuildings;
      this.state = options.state;
    },

    render: function(){
      var fieldName = this.layer.field_name
          counts = this.allBuildings.countBy(fieldName),
          fieldKeys = _.keys(counts),
          defaultCategoryState = {field: fieldName, values: [fieldKeys], other: true},
          categoryState = _.findWhere(this.state.get('categories'), {field: fieldName}) || defaultCategoryState,
          template = _.template(MapCategoryControlTemplate);

      if (fieldKeys[0] == "undefined") { return this; }

      var categories = _.map(counts, function(count, name){
        var stateHasValue = _.contains(categoryState.values, name),
            stateIsInverted = (categoryState.other === true || categoryState.other === 'true'),
            checked = stateIsInverted ? !stateHasValue : stateHasValue;
        return {
          checked: checked ? 'checked="checked"' : '',
          count: count,
          name: name
        }
      });

      categories = _.sortBy(categories, function(category){
        if (_.isNaN(parseFloat(category.name))){
          return category.name;
        }else{
          return parseFloat(category.name);
        }
      })

      var compiled = template({
        id: this.layer.field_name,
        title: this.layer.title,
        categories: categories
      });

      this.$el = $(compiled).appendTo(this.$container);
      this.delegateEvents();

      return this;
    },

    events: {
      'change .categories input' : 'toggleCategory'
    },

    toggleCategory: function(){
      var categories = this.state.get('categories'),
          fieldName = this.layer.field_name,
          unchecked = this.$el.find(".categories input:not(:checked)").map(function(){return $(this).val();}),
          checked = this.$el.find(".categories input:checked").map(function(){return $(this).val();});

      categories = _.reject(categories, function(f){ return f.field == fieldName; })

      if (unchecked.length < checked.length){
        categories.push({field: fieldName, values: unchecked.toArray(), other: true});
      } else if (checked.length > 0) {
        categories.push({field: fieldName, values: checked.toArray(), other: false});
      }

      this.state.set({categories: categories});
    }
  });

  return MapCategoryControlView;

});

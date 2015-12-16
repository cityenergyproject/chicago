define([
  'jquery',
  'underscore',
  'backbone',
  'ionrangeslider',
  'models/city',
  'text!templates/map_controls/category.html',
], function($, _, Backbone, Ion, CityModel, MapCategoryControlTemplate){
  var OTHER_LABEL = "Other";

  var MapCategoryControlView = Backbone.View.extend({
    $container: $('#map-category-controls'),

    initialize: function(options){
      this.layer = options.layer;
      this.allBuildings = options.allBuildings;
      this.state = options.state;

      var fieldName = this.layer.field_name
          counts = this.allBuildings.countBy(fieldName);

      var orderedValues = Object.keys(counts)
        .sort(function(a, b) {
          return counts[a] - counts[b];
        })
        .reverse();

      this.values = orderedValues.slice(0, 9).concat([OTHER_LABEL]);
      this.otherValues = orderedValues.slice(9);
    },

    render: function(){
      var fieldName = this.layer.field_name
          counts = this.allBuildings.countBy(fieldName),
          fieldKeys = _.keys(counts),
          defaultCategoryState = {field: fieldName, values: [fieldKeys], other: true},
          categoryState = _.findWhere(this.state.get('categories'), {field: fieldName}) || defaultCategoryState,
          template = _.template(MapCategoryControlTemplate);

      if (fieldKeys[0] == "undefined") { return this; }

      var categories = this.values
        .map(function(name) {
          var stateHasValue = _.contains(categoryState.values, name),
              stateIsInverted = (categoryState.other === true || categoryState.other === 'true'),
              checked = stateIsInverted ? !stateHasValue : stateHasValue;

          return {
            checked: checked ? 'checked="checked"' : '',
            count: counts[name] || 0,
            name: name
          };
        });

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
      'change .categories input' : 'toggleCategory',
      'click .categories .showAll': 'showAll',
      'click .categories .hideAll': 'hideAll'
    },

    toggleCategory: function(){
      var categories = this.state.get('categories'),
          fieldName = this.layer.field_name,
          unchecked = this.$el.find(".categories input:not(:checked)").map(function(){return $(this).val();}),
          checked = this.$el.find(".categories input:checked").map(function(){return $(this).val();});

      categories = _.reject(categories, function(f){ return f.field == fieldName; })

      if (unchecked.length < checked.length){
        var uncheckedValues = unchecked.toArray();

        if (uncheckedValues.indexOf(OTHER_LABEL) >= 0) {
          uncheckedValues = _.without(uncheckedValues, OTHER_LABEL).concat(this.otherValues);
        }

        categories.push({field: fieldName, values: uncheckedValues, other: true});
      } else if (checked.length > 0) {
        var checkedValues = checked.toArray();

        if (checkedValues.indexOf(OTHER_LABEL) >= 0) {
          checkedValues = _.without(checkedValues, OTHER_LABEL).concat(this.otherValues);
        }

        categories.push({field: fieldName, values: checkedValues, other: false});
      }

      this.state.set({categories: categories});
    },

    hideAll: function(){
      var categories = this.state.get('categories'),
          fieldName = this.layer.field_name,
          counts = this.allBuildings.countBy(fieldName),
          fieldKeys = _.keys(counts);

      categories = _.reject(categories, function(f){ return f.field == fieldName; })

      this.$el.find(".categories input").map(function() {this.checked = false;});

      categories.push({field: fieldName, values: fieldKeys, other: true});

      this.state.set({categories: categories});

      return false;
    },

    showAll: function(){
      var categories = this.state.get('categories'),
          fieldName = this.layer.field_name,
          counts = this.allBuildings.countBy(fieldName),
          fieldKeys = _.keys(counts);

      categories = _.reject(categories, function(f){ return f.field == fieldName; })

      this.$el.find(".categories input").map(function() {this.checked = true;});

      categories.push({field: fieldName, values: fieldKeys, other: false});

      this.state.set({categories: categories});

      return false;
    }
  });

  return MapCategoryControlView;

});

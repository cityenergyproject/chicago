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
    className: "map-control",
    $container: $('#map-category-controls'),

    initialize: function(opts){
      this.map = opts.map;
      this.id = "control-"+this.model.cid;
      this.el = "#"+this.id;
      this.$el = $("<div id='"+this.id+"' class='map-control'></div>").appendTo(this.$container);
      this.delegateEvents(this.events);

      this.listenTo(this.model, 'dataReady', this.update);
    },

    render: function(){ 
      $(this.el).html(
        "<p class='show-layer'>"+this.model.get('title')+"</p>"
      );
      this.update();
      return this;
    },

    update: function(){
      if (this.model.get('data') === undefined) {return this;}

      var displayed_categories = this.model.colorRampValues;
      displayed_categories.push({name: "Other", color: "#CCCCCC"});

      var template = _.template(MapCategoryControlTemplate);
      $(template({id: this.model.cid, categories: displayed_categories}))
      .appendTo($(this.el));

      return this;
    },

    events: {
      'click .show-layer' : 'showLayer',
      'change input.category.filter' : 'toggleCategory'
    },

    toggleCategory: function(){
      var unchecked = this.$el.find("input:not(:checked)").map(function(){return $(this).val();});
      if (unchecked.length==0){
        return this.model.set('filter', undefined);
      }
      var checked = this.$el.find("input:checked").map(function(){return $(this).val();});
      if (_.contains(checked, "Other")){
        
        this.model.set('filter', {exclude: unchecked.toArray()});
      } else {
        this.model.set('filter', {include: checked.toArray()});
      }

    },

    showLayer: function(){
      Backbone.history.navigate(this.map.get('city').get('url_name') + '/' + this.model.get('field_name'), {trigger: true});
    },






  });

  return MapCategoryControlView;

});
define([
  'jquery',
  'underscore',
  'backbone',
  'models/city/CityModel',
  'models/map/MapModel',
  'models/map/LayerModel',
  'views/map/LayerView',
  'views/map/MapControlView',
  'text!/app/templates/map_controls/MapControlCategoryTemplate.html'
], function($, _, Backbone,CityModel,MapModel,LayerModel,LayerView,MapControlView,MapControlCategoryTemplate){

  var MapView = Backbone.View.extend({
    el: $("#map"),

    initialize: function(){
      document.title = this.model.get('title');

      this.listenTo(this.model, 'change:city', this.changeCity);
      this.listenTo(this.model, 'cityChange', this.initWithCity);
    },

    initWithCity: function(){
      document.title = this.model.get('title');

      if (!this.leafletMap){
        this.leafletMap = new L.Map(this.el, {
          center: this.model.get('center'),
          zoom: this.model.get('zoom'),
          scrollWheelZoom: false
        });
        L.tileLayer(this.model.get('city').get('tileSource')).addTo(this.leafletMap);
      }

      this.currentLayerView = this.currentLayerView || new LayerView({mapView: this});
      this.render();
      return this;
    },

    render: function(){ 
      this.renderMapControls();
      return this;
    },

    renderMapControls: function(){
      this.renderCategories();
      var layers = this.model.get('city').layers;
      _.each(layers.models, function(layer){
        new MapControlView({model: layer, map: this.model}).render();
      }, this);
      return this;
    },

    renderCategories: function(){
      var $map_controls = $('#map-controls');
      if ($map_controls.find('.category').length > 0) { return this; }

      var categories = this.model.get('city').get('layer_categories');
      var categoryTemplate = _.template(MapControlCategoryTemplate);
      _.each(categories, function(category){
        $map_controls.append(categoryTemplate({category: category}));
      });
      return this;
    },

    changeCity: function(){
      console.log("change city")
      $('#map-controls').empty();
      this.leafletMap.setView(this.model.get('center'), parseInt(this.model.get('zoom')));
      // other cleanup here
    }



  });

  return MapView;

});
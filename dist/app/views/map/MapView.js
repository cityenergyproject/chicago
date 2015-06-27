define([
  'jquery',
  'underscore',
  'backbone',
  'models/city/CityModel',
  'models/map/MapModel',
  'models/map/LayerModel',
  'views/map/LayerView',
  'views/map/MapControlView'
], function($, _, Backbone,CityModel,MapModel,LayerModel,LayerView,MapControlView){

  var MapView = Backbone.View.extend({
    el: $("#map"),

    initialize: function(){
      document.title = this.model.get('title');

      this.map = new L.Map(this.el, {
        center: this.model.get('center'),
        zoom: this.model.get('zoom'),
        scrollWheelZoom: false
      });

      L.tileLayer(this.model.get('tileSource')).addTo(this.map);
    },

    render: function(){ 
      this.renderCurrentLayer();
      this.renderMapControls();
      return this;
    },

    renderCurrentLayer: function(){
      var city = this.model.get('city');
      var current_layer_name = this.model.get('current_layer');
      var currentLayer = city.layers.findWhere({field_name: current_layer_name});

      //find a better approach - show/hide/load?
      if (this.currentLayerView) {
        this.currentLayerView.model = currentLayer;
      }else{
        this.currentLayerView = new LayerView({model: currentLayer, leafletMap: this.map});
        this.listenTo(this.model, 'change:current_layer', this.update);
      }
      // this.currentLayerView.render(this.map);

      console.log("render " + current_layer_name);
      return this;
    },

    renderMapControls: function(){
      var layers = this.model.get('city').layers;
      _.each(layers.models, function(layer){
        new MapControlView({model: layer, map: this.model}).render();
      }, this);
      return this;
    },

    update: function(){
      var city = this.model.get('city');
      var current_layer_name = this.model.changed.current_layer;
      var currentLayer = city.layers.findWhere({field_name: current_layer_name});
      this.currentLayerView.model = currentLayer;
      this.currentLayerView.render();
    }



  });

  return MapView;

});
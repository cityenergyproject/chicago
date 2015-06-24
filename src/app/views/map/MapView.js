define([
  'jquery',
  'underscore',
  'backbone',
  'models/city/CityModel',
  'models/map/MapModel',
  'models/map/LayerModel',
  'views/map/LayerView'
], function($, _, Backbone,CityModel,MapModel,LayerModel,LayerView){

  var MapView = Backbone.View.extend({
    el: $("#map"),

    initialize: function(){

    },

    render: function(){ 
      document.title = this.model.get('title');

      this.map = new L.Map(this.el, {
        center: this.model.get('center'),
        zoom: this.model.get('zoom')
      });

      L.tileLayer(this.model.get('tileSource')).addTo(this.map);

      var city = this.model.get('city');
      var current_layer_name = this.model.get('current_layer');
      var current_layer = city.layers.findWhere({field_name: current_layer_name});
      var current_layer_view = new LayerView({model: current_layer}).render(this.map);

      return this;

    }

  });

  return MapView;

});
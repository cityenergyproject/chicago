define([
  'jquery',
  'underscore',
  'backbone',
  'models/map/MapModel',
  'models/map/LayerModel',
  'views/map/LayerView'
], function($, _, Backbone,MapModel,LayerModel,LayerView){

  var MapView = Backbone.View.extend({
    el: $("#map"),

    initialize: function(){
      this.model = new MapModel();
    },

    render: function(){ 
      document.title = this.model.get('title');

      this.map = new L.Map(this.el, {
        center: this.model.get('center'),
        zoom: this.model.get('zoom')
      });

      L.tileLayer(this.model.get('tileSource')).addTo(this.map);

      var defaultLayer = new LayerModel(this.model);
      var defaultMapLayer = new LayerView({model: defaultLayer}).render(this.map);

      return this;

    }

  });

  return MapView;

});
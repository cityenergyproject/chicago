define([
  'jquery',
  'underscore',
  'backbone',
  'models/map/MapModel',
  'models/map/LayerModel',
  'text!/app/templates/map/BuildingInfoTemplate.html'
], function($, _, Backbone,MapModel,LayerModel,BuildingInfoTemplate){

  var LayerView = Backbone.View.extend({

    initialize: function(options){  
      this.leafletMap = options.leafletMap;
      var newLayer = cartodb.createLayer(this.leafletMap, {
        user_name: 'cityenergyproject',
        type: 'cartodb',
        sublayers: [{
          sql: "SELECT * FROM " + this.model.get('table_name'),
          cartocss: this.model.cartoCSS(),
          interactivity: "cartodb_id, property_id, address_1, city, property_name, " + this.model.collection.pluck('field_name').join(', ')
        }]
      })
      .addTo(this.leafletMap)
      .on('done', function(layer) {
        this.leafletLayer = layer
        sub = layer.getSubLayer(0);
        sub.setInteraction(true);
        sub.on('featureClick', function(e, latlng, pos, data) {
          console.log(data);
          this.showBuildingInfo(e, latlng, pos, data)
        }, this)
        .on('featureOver', function(e, latlng, pos, data) {
          $('#map').css('cursor', "help");
        })
        .on('featureOut', function(e, latlng, pos, data) {
          $('#map').css('cursor', "auto");
        });

      }, this);
      // this.el = layer // need to consider what el really is here
    },

    render: function(){
      this.leafletLayer.getSubLayer(0).setCartoCSS(this.model.cartoCSS())
      return this;
    },

    showBuildingInfo: function(e, latlng, pos, data){
      template = _.template(BuildingInfoTemplate)
      info = L.popup()
        .setLatLng(latlng)
        .setContent(template(data))
        .openOn(this.leafletMap);
    }

  });

  return LayerView;

});
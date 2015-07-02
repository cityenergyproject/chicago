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
        sublayers: [this.model.cartoProperties()]
      })
      .addTo(this.leafletMap)
      .on('done', function(layer) {
        this.leafletLayer = layer;
        sub = layer.getSubLayer(0);
        sub.setInteraction(true);
        sub.on('featureClick', function(e, latlng, pos, data) {
          this.showBuildingInfo(e, latlng, pos, data);
        }, this)
        .on('featureOver', function(e, latlng, pos, data) {
          $('#map').css('cursor', "help");
        })
        .on('featureOut', function(e, latlng, pos, data) {
          $('#map').css('cursor', "auto");
        });

      }, this);
      // this.el = layer // need to consider what el really is here

      this.listenTo(this.model, 'dataReady', this.render);
      this.listenTo(this.model.collection, 'change:filter', this.render);
      
    },

    render: function(){
      this.leafletLayer.getSubLayer(0).set(this.model.cartoProperties());
      console.log(this.model.cartoProperties())
      return this;
    },

    showBuildingInfo: function(e, latlng, pos, data){
      console.log(data);
      var mapped_data = {
        property_id: data.property_id,
        name: data.property_name,
        address: data.address_1 + ", " + data.city
      };
      var data_fields = _.map(this.model.collection.models, function(layer){
        return {
          field_name: layer.get('field_name'),
          title: layer.get('title'),
          value: this[layer.get('field_name')]
        }; 
      }, data);
      mapped_data.data_fields = data_fields;

      template = _.template(BuildingInfoTemplate);
      info = L.popup()
        .setLatLng(latlng)
        .setContent(template(mapped_data))
        .openOn(this.leafletMap);
    }

  });

  return LayerView;

});
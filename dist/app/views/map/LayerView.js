define([
  'jquery',
  'underscore',
  'backbone',
  'models/map/MapModel',
  'models/map/LayerModel',
  'text!/app/templates/map/BuildingInfoTemplate.html'
], function($, _, Backbone,MapModel,LayerModel,BuildingInfoTemplate){

  var LayerView = Backbone.View.extend({
    model: LayerModel,

    initialize: function(options){ 
      this.mapView = options.mapView;
      this.leafletMap = options.mapView.leafletMap;

      this.setCurrentLayer();

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
      this.listenTo(this.mapView.model, 'change:current_layer', this.showCurrentLayer);
      
    },

    render: function(){
      this.leafletLayer.getSubLayer(0).set(this.model.cartoProperties());
      console.log(this.model.cartoProperties())
      return this;
    },

    showCurrentLayer: function(){
      this.setCurrentLayer().render();
    },

    setCurrentLayer: function(){
      var current_layer = this.mapView.model.getCurrentLayer();
      if (current_layer===undefined){
        alert("City has no data for " + this.mapView.model.get('current_layer'));
        // maybe reset route?
      }else{
        this.model = current_layer;
      }
      return this;
    },

    showBuildingInfo: function(e, latlng, pos, data){
      console.log(data);

      var building_info_fields = this.model.collection.city.get('building_info_fields');
      var mapped_data = _.mapObject(building_info_fields, function(value, key){
        return data[value];
      });
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
define([
  'jquery',
  'underscore',
  'backbone',
  'models/map/MapModel',
  'models/map/LayerModel',
], function($, _, Backbone,MapModel,LayerModel){

  var LayerView = Backbone.View.extend({

    initialize: function(){  
    },

    render: function(lMap){
      var layer = cartodb.createLayer(lMap, {
        user_name: 'cityenergyproject',
        type: 'cartodb',
        sublayers: [{
          sql: "SELECT * FROM " + this.model.map.get('table_name'),
          cartocss: this.model.cartoCSS(),
          interactivity: "cartodb_id, " + this.model.get('field_name')
        }]
      })
      .addTo(lMap)
      .on('done', function(layer) {
        sub = layer.getSubLayer(0);
        sub.setInteraction(true);
        sub.on('featureClick', function(e, latlng, pos, data) {
          // Map.showInfoWindow(e, latlng, pos, data);
          console.log(data);
        })
        .on('featureOver', function(e, latlng, pos, data) {
          $('#map').css('cursor', "help");
        })
        .on('featureOut', function(e, latlng, pos, data) {
          $('#map').css('cursor', "auto");
        });

      });
      // this.el = layer // need to consider what el really is here
      return this;





    }

  });

  return LayerView;

});
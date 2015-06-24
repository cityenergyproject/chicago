define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var MapModel = Backbone.Model.extend({

    defaults : {
        title : 'City Energy - Los Angeles',
        tileSource : 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',      
    },

    initialize: function(){
      var center = {
        center: this.get('city').get('center'),
        zoom: this.get('city').get('zoom')
      };
      this.set(center);
    }

  });

  return MapModel;

});
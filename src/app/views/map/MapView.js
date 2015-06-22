define([
  'jquery',
  'underscore',
  'backbone',
  'models/map/MapModel',
  'text!/app/templates/map/mapTemplate.html'
], function($, _, Backbone,MapModel,mapTemplate){

  var MapView = Backbone.View.extend({
    el: $("#map"),

    initialize: function(){
      var self = this;
      self.model = new MapModel();
    },

    render: function(){
      var mapTitle = this.model.get('title');
      document.title = mapTitle;
      var mapData = {
        title: mapTitle
      }

      var compiledTemplate = _.template( mapTemplate ); //prerender template
      this.$el.html(compiledTemplate(mapData));

    }

  });

  return MapView;

});
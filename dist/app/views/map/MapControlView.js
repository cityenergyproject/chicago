define([
  'jquery',
  'underscore',
  'backbone',
  'models/city/CityModel',
  'models/map/MapModel',
  'models/map/LayerModel',
  'router',
], function($, _, Backbone,CityModel,MapModel,LayerModel,AppRouter){

  var MapControlView = Backbone.View.extend({
    className: "map-control",

    initialize: function(opts){
      this.map = opts.map
      this.id = "control-"+this.model.cid;
      this.el = "#"+this.id;
      this.$el = $("<div id='"+this.id+"' class='map-control'></div>").appendTo("#map-controls");
      this.delegateEvents(this.events);
    },

    render: function(){ 
      $(this.el).html(
        "<p class='show-layer'>"+this.model.get('title')+"</p>"
      );
      return this;
    },

    events: {
      'click .show-layer' : 'showLayer'
    },

    showLayer: function(){
      // this.map.set("current_layer", this.model.get('field_name')); //using router I think
      Backbone.history.navigate('los_angeles/' + this.model.get('field_name'), {trigger: true});
    }



  });

  return MapControlView;

});
define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var MapModel = Backbone.Model.extend({

    defaults : {
        title : 'City Energy',
        current_layer: ''   
    },

    initialize: function(){
      this.listenTo(this.get('city'), 'cityLoaded', this.cityChange);
      this.listenTo(this.get('city'), 'change:year', this.yearChange);
    },

    getCurrentLayer: function(){
      if (this.get('current_layer')===''){
        Backbone.history.navigate(this.get('city').get('url_name') + '/' + this.get('city').get('year') + '/' + this.get('city').get('default_layer'), {trigger: false, replace: true});
        this.set({current_layer: this.get('city').get('default_layer')}, {silent: true});
      }
      var current_layer = this.get('city').layers.findWhere({field_name: this.get('current_layer')});
      return current_layer;

    },

    cityChange: function(){
      this.set({title: this.get('title') + "- " + this.get('city').get('name')});
      this.set({center : this.get('city').get('center')});
      this.set({zoom: this.get('city').get('zoom')});

      this.getCurrentLayer();

      this.trigger('cityChange');
      
      return this;
    },

    yearChange: function(){
      
      this.trigger('yearChange');
      this.getCurrentLayer();

    }


  });

  return MapModel;

});
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
      this.listenTo(this.get('city'), 'change', this.cityChange)
    },

    getCurrentLayer: function(){
      if (this.get('current_layer')===''){
        Backbone.history.navigate(this.get('city').get('url_name') + '/' + this.get('city').get('default_layer'), {trigger: false, replace: true});
        this.set({current_layer: this.get('city').get('default_layer')}, {silent: true});
      }
      return this.get('city').layers.findWhere({field_name: this.get('current_layer')});
    },

    cityChange: function(){
      this.set({title: this.get('title') + "- " + this.get('city').get('name')});
      this.set({center : this.get('city').get('center')});
      this.set({zoom: this.get('city').get('zoom')});

      this.getCurrentLayer();

      this.trigger('cityChange');
      
      return this;
    }


  });

  return MapModel;

});
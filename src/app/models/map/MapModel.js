define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var MapModel = Backbone.Model.extend({

    defaults : {
        title : 'HOME'
    }

  });

  return MapModel;

});
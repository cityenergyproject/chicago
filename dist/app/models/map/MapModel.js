define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var MapModel = Backbone.Model.extend({

    defaults : {
        title : 'City Energy - Los Angeles',
        table_name : 'losangelestestdatasetcep_na_to_null_20150619',
        tileSource : 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
        center: [34.093041824023125, -118.30215454101562],
        zoom : 11
    }

  });

  return MapModel;

});
define([
  'backbone',
], function(Backbone) {
  var CityModel = Backbone.Model.extend({
    url: function(){
      return "/cities/" + this.get('url_name') + ".json";
    }
  });

  return CityModel;
});

define([
  'backbone',
], function(Backbone) {
  var City = Backbone.Model.extend({
    url: function(){
      return "cities/" + this.get('url_name') + ".json";
    }
  });

  return City;
});

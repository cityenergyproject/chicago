define([
  'jquery',
  'underscore',
  'backbone',
  'text!/app/templates/map/AddressSearchTemplate.html'
], function($, _, Backbone, AddressSearchTemplate){

  var AddressSearchView = Backbone.View.extend({
    $container: $('#search'),

    initialize: function(options){
      this.mapView = options.mapView; 
      this.center = this.mapView.model.get('center');
      this.$el = $('<div id="address-search" class="search-control"></div>').appendTo(this.$container);
      this.delegateEvents(this.events);

      this.render();
    },

    render: function(){
      var searchTemplate = _.template(AddressSearchTemplate);
      this.$el.html(searchTemplate());

      return this;
    },

    events: {
      'change input' : 'search'
    },

    search: function(){
      var self = this;
      var url = "http://pelias.mapzen.com/search";
      var search = this.$el.find('input').val();
      $.ajax({
        url: url,
        data: {input: search, size: 1, lat: this.center[0], lon: this.center[1]},
        success: function(response){
          self.centerMapOn(response);
        }
      })
    },

    centerMapOn: function(location){ 
      // location.features[0].geometry.coordinates
      // this.leafletMap.setView(this.model.get('center'), parseInt(this.model.get('zoom')));
      // debugger
      this.mapView.leafletMap.setView(location.features[0].geometry.coordinates.reverse());
    }

  });

  return AddressSearchView;

});
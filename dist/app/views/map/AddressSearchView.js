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
      this.delegateEvents(this.events);

      this.render();
    },

    render: function(){
      var searchTemplate = _.template(AddressSearchTemplate);
      this.$container.html(searchTemplate());
      this.$el = this.$container.find("input");
      this.delegateEvents(this.events);
      return this;
    },

    events: {
      'change' : 'search',
      'search' : 'fireChange'
    },

    search: function(){
      var self = this;
      var url = "http://pelias.mapzen.com/search";
      var search = this.$el.val();
      if (search===""){
        this.clearMarker();
        return;
      }
      $.ajax({
        url: url,
        data: {input: search, size: 1, lat: this.center[0], lon: this.center[1]},
        success: function(response){
          self.centerMapOn(response);
        }
      })
    },

    centerMapOn: function(location){
      var coordinates = location.features[0].geometry.coordinates.reverse();
      this.placeMarker(coordinates);
      this.mapView.leafletMap.setView(coordinates);
    },
    placeMarker: function(coordinates){
      var map = this.mapView.leafletMap;
      this.clearMarker();

      var icon = new L.Icon({
          iconUrl: '/images/marker.svg',
          iconRetinaUrl: '/images/marker.svg',
          iconSize: [16, 28],
          iconAnchor: [8, 28],
          popupAnchor: [-3, -76],
          shadowUrl: '',
          shadowRetinaUrl: '',
          shadowSize: [0, 0],
          shadowAnchor: [22, 94]
      });
      this.marker = L.marker(coordinates, {icon: icon}).addTo(map);
    },

    clearMarker: function(){
      var map = this.mapView.leafletMap;
      if (this.marker){
        map.removeLayer(this.marker);
      }
    },

    fireChange: function(){
      this.$el.trigger('change');
    }

  });

  return AddressSearchView;

});

(function() {

  var Map = {
    TABLE: 'la_data_fake',
    map: {},

    init: function() {

      var map = new L.Map('map', {
        center: [34.093041824023125, -118.30215454101562], // Los Angeles
        zoom: 11
      });
      this.map = map

      L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png').addTo(map);

      fieldName = 'primary_property_type___epa_calculated'

      cartodb.createLayer(map, {
        user_name: 'cityenergyproject',
        type: 'cartodb',
        sublayers: [{
          sql: "SELECT * FROM " + this.TABLE,
          cartocss: this.cartoCSS(fieldName),
          interactivity: "cartodb_id, " + fieldName
        }]
      })
      .addTo(map)
      .on('done', function(layer) {
        sub = layer.getSubLayer(0);
        sub.setInteraction(true);
        sub.on('featureClick', function(e, latlng, pos, data) {
          Map.showInfoWindow(e, latlng, pos, data);
        })
        .on('featureOver', function(e, latlng, pos, data) {
          $('#map').css('cursor', "help");
        })
        .on('featureOut', function(e, latlng, pos, data) {
          $('#map').css('cursor', "auto");
        });

      });

    },

    showInfoWindow: function(e, latlng, pos, data) {
      template = _.template($('#infowindow_template').html())
      info = L.popup()
        .setLatLng(latlng)
        .setContent(template(data))
        .openOn(Map.map);
    },

    cartoCSS: function(fieldName) {
      var base = [
            '{marker-fill: #999;',
            'marker-fill-opacity: 0.8;',
            'marker-line-color: #FFF;',
            'marker-line-width: 0.5;',
            'marker-line-opacity: 1;',
            'marker-placement: point;',
            'marker-multi-policy: largest;',
            'marker-type: ellipse;',
            'marker-allow-overlap: true;',
            'marker-clip: false;}'
        ];

      var typeBuckets = [
          {name: 'K-12 School', value: '#A6CEE3'},
          {name: 'Office', value: '#1F78B4'},
          {name: 'Medical Office', value: '#52A634'},
          {name: 'Warehouse', value: '#B2DF8A'},
          {name: 'College/University', value: '#33A02C'},     
          {name: 'Retail', value: '#E31A1C'},
          {name: 'Municipal', value: '#FDBF6F'},
          {name: 'Multifamily', value: '#FF7F00'},
          {name: 'Hotel', value: '#CAB2D6'},
          {name: 'Industrial', value: '#6A3D9A'},
          {name: 'Worship', value: '#9C90C4'},
          {name: 'Supermarket', value: '#E8AE6C'},
          {name: 'Parking', value: '#62afe8'},
          {name: 'Laboratory', value: '#3AA3FF'},
          {name: 'Hospital', value: '#C6B4FF'},
          {name: 'Data Center', value: '#a3d895'},
          {name: 'Unknown', value: '#DDDDDD'},
          {name: 'Other', value: '#FB9A99'}
        ];

      var typeCSS = typeBuckets.map(function(bucket){
        return "#" + this.TABLE + "[" + fieldName + "='" + bucket.name + "']{marker-fill:" + bucket.value + ";}";
      }, this);

      return '#' + this.TABLE + base.join(['\n']) +'\n' + typeCSS.join(['\n']);

    }
  
  };

  window.Map = Map;

}).call(this);
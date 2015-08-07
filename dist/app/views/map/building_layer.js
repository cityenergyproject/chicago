define([
  'jquery',
  'underscore',
  'backbone',
  'collections/city_buildings',
  'models/building_color_bucket_calculator',
  'text!/app/templates/map/building_info.html'
], function($, _, Backbone, CityBuildings, BuildingColorBucketCalculator, BuildingInfoTemplate){

  var baseCartoCSS = [
    '{marker-fill: #CCC;' +
    'marker-fill-opacity: 0.9;' +
    'marker-line-color: #FFF;' +
    'marker-line-width: 0.5;' +
    'marker-line-opacity: 1;' +
    'marker-placement: point;' +
    'marker-multi-policy: largest;' +
    'marker-type: ellipse;' +
    'marker-allow-overlap: true;' +
    'marker-clip: false;}'
  ];

  var CartoStyleSheet = function(tableName, bucketCalculator) {
    this.tableName = tableName;
    this.bucketCalculator = bucketCalculator;
  }

  CartoStyleSheet.prototype.toCartoCSS = function(){
    var bucketCSS = this.bucketCalculator.toCartoCSS(),
        styles = baseCartoCSS.concat(bucketCSS),
        tableName = this.tableName;
    styles = _.reject(styles, function(s) { return !s; });
    styles = _.map(styles, function(s) { return "#" + tableName + " " + s; });
    return styles.join("\n");
  };

  var LayerView = Backbone.View.extend({
    initialize: function(options){
      this.state = options.state;
      this.leafletMap = options.leafletMap;
      this.allBuildings = new CityBuildings(null, {});

      this.listenTo(this.state, 'change:layer', this.onStateChange);
      this.listenTo(this.state, 'change:tableName', this.onStateChange);
      this.listenTo(this.allBuildings, 'sync', this.render);
      this.onStateChange();
    },

    onFeatureClick: function(e, latlng, pos, data){
      var template = _.template(BuildingInfoTemplate),
          popupFields = this.state.get('city').get('popup_fields');
          populatedLabels = _.reduce(popupFields, function(labels, field){
            labels.push({label: field.label, value: data[field.field]});
            return labels;
          }, []);
      L.popup()
       .setLatLng(latlng)
       .setContent(template({labels: populatedLabels}))
       .openOn(this.leafletMap);
    },
    onFeatureOver: function(){
      $('#map').css('cursor', "help");
    },
    onFeatureOut: function(){
      $('#map').css('cursor', '');
    },

    onStateChange: function(){
      _.extend(this.allBuildings, this.state.pick('tableName', 'cartoDbUser'));
      this.allBuildings.fetch();
    },

    toCartoSublayer: function(){
      var buildings = this.allBuildings,
          state = this.state,
          city = state.get('city'),
          popupFields = _.pluck(city.get('popup_fields'), 'field').join(','),
          fieldName = state.get('layer'),
          cityLayer = _.findWhere(city.get('map_layers'), {field_name: fieldName}),
          buckets = cityLayer.range_slice_count
          colorStops = cityLayer.color_range,
          calculator = new BuildingColorBucketCalculator(buildings, fieldName, buckets, colorStops),
          stylesheet = new CartoStyleSheet(buildings.tableName, calculator);
      return {
        sql: buildings.toSql(state.get('categories'), state.get('filters')),
        cartocss: stylesheet.toCartoCSS(),
        interactivity: popupFields
      }
    },

    render: function(){
      if(this.cartoLayer) {
        this.cartoLayer.getSubLayer(0).set(this.toCartoSublayer()).show();
        return this;
      }
      cartodb.createLayer(this.leafletMap, {
        user_name: 'cityenergyproject',
        type: 'cartodb',
        sublayers: [this.toCartoSublayer()]
      }).addTo(this.leafletMap).on('done', this.onCartoLoad, this);
      return this;
    },
    onCartoLoad: function(layer) {
      var sub = layer.getSubLayer(0);
      this.cartoLayer = layer;
      sub.setInteraction(true);
      sub.on('featureClick', this.onFeatureClick, this);
      sub.on('featureOver', this.onFeatureOver, this);
      sub.on('featureOut', this.onFeatureOut, this);
    }
  });

  return LayerView;

});

// Filename: router.js
define([
  'jquery',
  'underscore',
  'backbone',
  'models/city',
  'collections/city_buildings',
  'views/layout/header',
  'views/map/map',
  'views/map/address_search',
  'views/map/year_control',
  'views/building_comparison/building_comparison',
], function($, _, Backbone, CityModel, CityBuildings, HeaderView, MapView, AddressSearchView, YearControlView, BuildingComparisonView) {
  $.deparam = jq_deparam = function( params, coerce ) {
    var obj = {},
      coerce_types = { 'true': !0, 'false': !1, 'null': null };

    // Iterate over all name=value pairs.
    $.each( params.replace( /\+/g, ' ' ).split( '&' ), function(j,v){
      var param = v.split( '=' ),
        key = decodeURIComponent( param[0] ),
        val,
        cur = obj,
        i = 0,

        // If key is more complex than 'foo', like 'a[]' or 'a[b][c]', split it
        // into its component parts.
        keys = key.split( '][' ),
        keys_last = keys.length - 1;

      // If the first keys part contains [ and the last ends with ], then []
      // are correctly balanced.
      if ( /\[/.test( keys[0] ) && /\]$/.test( keys[ keys_last ] ) ) {
        // Remove the trailing ] from the last keys part.
        keys[ keys_last ] = keys[ keys_last ].replace( /\]$/, '' );

        // Split first keys part into two parts on the [ and add them back onto
        // the beginning of the keys array.
        keys = keys.shift().split('[').concat( keys );

        keys_last = keys.length - 1;
      } else {
        // Basic 'foo' style key.
        keys_last = 0;
      }

      // Are we dealing with a name=value pair, or just a name?
      if ( param.length === 2 ) {
        val = decodeURIComponent( param[1] );

        // Coerce values.
        if ( coerce ) {
          val = val && !isNaN(val)            ? +val              // number
            : val === 'undefined'             ? undefined         // undefined
            : coerce_types[val] !== undefined ? coerce_types[val] // true, false, null
            : val;                                                // string
        }

        if ( keys_last ) {
          // Complex key, build deep object structure based on a few rules:
          // * The 'cur' pointer starts at the object top-level.
          // * [] = array push (n is set to array length), [n] = array if n is
          //   numeric, otherwise object.
          // * If at the last keys part, set the value.
          // * For each keys part, if the current level is undefined create an
          //   object or array based on the type of the next keys part.
          // * Move the 'cur' pointer to the next level.
          // * Rinse & repeat.
          for ( ; i <= keys_last; i++ ) {
            key = keys[i] === '' ? cur.length : keys[i];
            cur = cur[key] = i < keys_last
              ? cur[key] || ( keys[i+1] && isNaN( keys[i+1] ) ? {} : [] )
              : val;
          }

        } else {
          // Simple key, even simpler rules, since only scalars and shallow
          // arrays are allowed.

          if ( $.isArray( obj[key] ) ) {
            // val is already an array, so push on the next value.
            obj[key].push( val );

          } else if ( obj[key] !== undefined ) {
            // val isn't an array, but since a second value has been specified,
            // convert val into an array.
            obj[key] = [ obj[key], val ];

          } else {
            // val is a scalar.
            obj[key] = val;
          }
        }

      } else if ( key ) {
        // No value was defined, so set something meaningful.
        obj[key] = coerce
          ? undefined
          : '';
      }
    });

    return obj;
  };

  var RouterState = Backbone.Model.extend({
    queryFields: ['filters', 'categories', 'layer', 'metrics', 'sort', 'order', 'lat', 'lng', 'zoom'],
    defaults: {
      metrics: [],
      categories: {},
      filters: {}
    },
    toQuery: function(){
      var query, attributes = this.pick(this.queryFields);
      query = $.param(attributes);
      return '?' + query;
    },
    toUrl: function(){
      var path;
      if (this.get('year')) {
        path = "/" + this.get('url_name') + "/" + this.get('year') + this.toQuery();
      } else {
        path = "/" + this.get('url_name') + this.toQuery();
      }
      return path;
    },
    asBuildings: function() {
      return new CityBuildings(null, this.pick('tableName', 'cartoDbUser'));
    }
  });

  var StateBuilder = function(city, year, layer) {
    this.city = city;
    this.year = year;
    this.layer = layer;
  };

  StateBuilder.prototype.toYear = function() {
    var currentYear = this.year;
    var availableYears = _.chain(this.city.years).keys().sort();
    var defaultYear = availableYears.last().value();
    return availableYears.contains(currentYear).value() ? currentYear : defaultYear;
  }

  StateBuilder.prototype.toLayer = function(year) {
    var currentLayer = this.layer;
    var availableLayers = _.chain(this.city.map_layers).pluck('field_name');
    var defaultLayer = this.city.years[year].default_layer;
    return availableLayers.contains(currentLayer).value() ? currentLayer: defaultLayer;
  }

  StateBuilder.prototype.toState = function() {
    var year = this.toYear();
    return {
      year: year,
      cartoDbUser: this.city.cartoDbUser,
      tableName: this.city.years[year].table_name,
      layer: this.toLayer(year),
    }
  };

  var Router = Backbone.Router.extend({
    state: new RouterState({}),
    routes:{
        "": "root",
        ":cityname": "city",
        ":cityname/": "city",
        ":cityname/:year": "year",
        ":cityname/:year/": "year",
        ":cityname/:year?:params": "year",
        ":cityname/:year/?:params": "year",
    },
    initialize: function(){
      var headerView = new HeaderView({state: this.state});
      var comparisonView = new BuildingComparisonView({state: this.state});
      var yearControlView = new YearControlView({state: this.state});
      var mapView = new MapView({state: this.state});
      var addressSearchView = new AddressSearchView({mapView: mapView, state: this.state});
      this.state.on('change', this.onChange, this);
      this.state.on('change:year', this.onDataSourceChange, this);
      this.state.on('change:url_name', this.onDataSourceChange, this);
    },
    onChange: function(){
      this.navigate(this.state.toUrl(), {trigger: false, replace: true});
    },
    onDataSourceChange: function(){
      var city = new CityModel(this.state.pick('url_name', 'year'));
      city.fetch({success: _.bind(this.onCitySync, this)});
    },
    onCitySync: function(city, results) {
      var year = this.state.get('year'),
          layer = this.state.get('layer'),
          newState = new StateBuilder(results, year, layer).toState(),
          defaultMapState = {lat: city.get('center')[0], lng: city.get('center')[1], zoom: city.get('zoom')},
          mapState = this.state.pick('lat', 'lng', 'zoom');
      this.state.set(_.extend({city: city}, newState, mapState, this.state.pick));
    },

    root: function () {
      this.navigate('/los_angeles', {trigger: true, replace: true});
    },

    city: function(cityname){
      this.state.set({url_name: cityname});
    },

    year: function(cityname, year, params){
      if (params) { params = $.deparam(params); }
      this.state.set(_.extend({}, params, {url_name: cityname, year: year}));
    }
  });

  return Router;
});




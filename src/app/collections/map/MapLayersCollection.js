define([
  'underscore',
  'backbone',
  'models/map/LayerModel'
], function(_, Backbone, LayerModel) {

  var MapLayersCollection = Backbone.Collection.extend({
    model: LayerModel,

    defaults : {
    },

    initialize: function(models, params){  
      this.city = params.city;
        
      this.cartoClient = new cartodb.SQL({ user: 'cityenergyproject' });
      this.listenTo(this.city, 'change:cartoDbUser', function(){
        this.cartoClient.options.user = this.city.get('cartoDbUser');
      });

      this.listenTo(this.city, 'change:map_layers', this.update);
    },

    interactivity: function(){
      return "cartodb_id, " + _.values(this.city.get('building_info_fields')).join(', ') + ", " + this.pluck('field_name').join(', ');
    },

    filtersSQL: function(){
      var sql = this.map(function(layer){
        if(layer.get('filter')===undefined){return "";}
        return layer.get('field_name') + " BETWEEN " + layer.get('filter').join(' AND ') ;
      });
      return _.compact(sql).join(' AND ');
    },

    update: function(){
      this.reset(null);
      var layers = this.city.get('map_layers').map(function(layer){
        _.extend(layer, {table_name: this.city.get('table_name')});
        return new LayerModel(layer);
      }, this);
      this.add(layers);
      this.fetch();
    },

    fetch: function(){
      var self = this;
      this.cartoClient.execute("SELECT * FROM " + this.city.get('table_name'))
      .done(function(data) {
        self.each(function(layer){
          var data = this;
          layer.set('data', _.pluck(data, layer.get('field_name')));
        }, data.rows);
      });
    }

  });

  return MapLayersCollection;

});
define([
  'underscore',
  'backbone',
  'd3',
  'models/map/LayerModel'
], function(_, Backbone,d3,LayerModel) {

  // look at making a LayerModel that gets subclassed here
  var CategoryLayerModel = Backbone.Model.extend({

    defaults : {

        baseCSS : [
            '{marker-fill: #CCC;',
            'marker-fill-opacity: 0.9;',
            'marker-line-color: #FFF;',
            'marker-line-width: 0.5;',
            'marker-line-opacity: 1;',
            'marker-placement: point;',
            'marker-multi-policy: largest;',
            'marker-type: ellipse;',
            'marker-allow-overlap: true;',
            'marker-clip: false;}'
        ],
        categories_to_show : 10
    },

    initialize: function(){
      this.empty = true;
      this.on('change:data', this.setDataFields);
    },

    setDataFields: function(){
      var data = this.get('data');
      if (_.every(data, function(d){return d===undefined;})){
        this.empty = true;
      }else{
        this.empty = false;
        this.setDisplayedCategories();
      }
      this.trigger('dataReady');
    },

    getFilter: function(){
      return this.get('filter');
    },

    filterSQL: function(){
      var field_name = this.get('field_name');
      var categories = _.values(this.get('filter'))[0];
      var key = _.keys(this.get('filter'))[0];
      var op = (key == 'exclude') ? '!=' : '=';

      var sql = categories.map(function(category){
        return  field_name + op + "'" + category + "'";
      });

      // find a better way
      if (sql.length === 0){return 'NULLSET';}

      var sqlJoin = (key == 'exclude') ? ' AND ' : ' OR ';
      return "(" + sql.join(sqlJoin) + ")";
    },

    cartoProperties: function(){
      var base_sql = "SELECT * FROM " + this.get('table_name');

      var filtersSQL = this.collection.filtersSQL();

      if (filtersSQL.indexOf('NULLSET') > -1){return undefined;}

      var sql = base_sql + ((filtersSQL == '') ? "" : " WHERE " + filtersSQL);
      return {
          sql: sql,
          cartocss: this.cartoCSS(),
          interactivity: this.collection.interactivity()
        };
    },

    cartoCSS: function(){
      var table_name = this.get('table_name');
      var field_name = this.get('field_name');
      var baseCSS = this.get('baseCSS');
      var dataCSS = [];
      var self = this;

      // may want to put a linear option in LayerModel, will need to rework this if so
      if (this.get('data')){
        dataCSS = this.colorRampValues.map(function(value){
          return "#" + table_name + "[" + field_name + "='" + value.name + "']{marker-fill:" + value.color + ";}";
        });
      }
      return '#' + table_name + baseCSS.join(['\n']) +'\n' + dataCSS.join(['\n']);

    },

    setDisplayedCategories: function(){
      var self = this;
      var category_counts = this.distributionData();
      this.displayedCategories = _.reject(category_counts, function(category){
        return category.name == "Other";
      }).slice(0,this.get('categories_to_display'));

      return this;
    },

    distributionData: function(){
      if (this.empty) {return undefined;}
      var self = this;

      var data = this.get('data');
      var categories = _.uniq(data).map(function(category){
        return {name: category, count: 0};
      });

      _.each(data, function(value){
        if (value === null) {return;}

        var category = _.findWhere(categories, {name: value});
        category.count += 1;

      });
      return _.sortBy(categories, 'count').reverse();
    },

  });

  return CategoryLayerModel;

});

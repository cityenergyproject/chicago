define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var urlTemplate = _.template(
    "https://<%= user_name %>.cartodb.com/api/v2/sql"
  );

  var CityBuildingQuery = function(table_name, categories, ranges) {
    this.table_name = table_name;
    this.categories = categories;
    this.ranges = ranges;
  };

  CityBuildingQuery.prototype.toRangeSql = function() {
    return _.map(this.ranges, function(range){
      return range.field + " BETWEEN " + range.min + " AND " + range.max;
    });
  };

  CityBuildingQuery.prototype.toCategorySql = function() {
    return _.map(this.categories, function(category){
      var operation = category.other ? "NOT IN" : "IN";
      return category.field + " " + operation + " (" + category.values.join(', ') + ")";
    });
  };

  CityBuildingQuery.prototype.toSql = function() {
    var table = this.table_name;
    var rangeSql = this.toRangeSql();
    var categorySql = this.toCategorySql();
    var filterSql = rangeSql.concat(categorySql).join(' AND ');
    var output = ["SELECT * FROM " + table].concat(filterSql).filter(function(e) { return e.length > 0; });
    return output.join(" WHERE ");
  };

  var CityBuildings = Backbone.Collection.extend({
    initialize: function(models, options){
      this.table_name = options.city.get('table_name');
      this.user_name = options.city.get('cartoDbUser');
    },
    url: function() {
      return urlTemplate(this);
    },
    fetch: function(categories, range) {
      var query = this.toSql(categories, range);
      var result = Backbone.Collection.prototype.fetch.apply(this, [{data: {q: query}}]);
      return result;
    },
    parse: function(data){
      return data.rows;
    },
    toSql: function(categories, range){
      return new CityBuildingQuery(this.table_name, categories, range).toSql()
    }
  });

  return CityBuildings;
});

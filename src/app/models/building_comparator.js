define([
  'backbone'
], function(_, Backbone) {
  function BuildingComparator(field, ascending) {
    this.field = field;
    this.ascending = ascending;
  }

  BuildingComparator.prototype.isNumber = function(obj){
    return parseFloat(obj) !== NaN;
  };

  BuildingComparator.prototype.compareString = function(a, b, ascending){
    return ascending * (a.localeCompare(b));
  };

  BuildingComparator.prototype.compareNumber = function(a, b, ascending){
    return ascending * (a < b ? -1 : (a > b ? 1 : 0));
  };

  BuildingComparator.prototype.getComparator = function(a, b){
    return {
      true: this.compareNumber,
      false: this.compareString
    }[this.isNumber(a) || this.isNumber(b)];
  };

  BuildingComparator.prototype.compare = function(building, other){
    var a = building.get(this.field),
        b = other.get(this.field),
        ascending = (this.ascending ? 1 : -1);
    return this.getComparator(a, b)(a, b, ascending);
  };

  return BuildingComparator;
});

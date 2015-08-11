define([
  'underscore',
  'd3'
], function(_, d3) {
  var BuildingBucketCalculator = function(buildings, fieldName, buckets, filterRange) {
    this.buildings = buildings;
    this.fieldName = fieldName;
    this.buckets = buckets;
    this.filterRange = filterRange || {};
  };

  BuildingBucketCalculator.prototype.toExtent = function() {
    var fieldValues = this.buildings.pluck(this.fieldName),
        extent = d3.extent(fieldValues),
        min = this.filterRange.min,
        max = this.filterRange.max;
    return [min || extent[0], max || extent[1]];
  };

  BuildingBucketCalculator.prototype.toBucket = function(value) {
    var extent = this.toExtent(),
        maxBuckets = this.buckets - 1,
        slices = [0, maxBuckets],
        scale = d3.scale.linear().domain(extent).rangeRound(slices);

    return _.min([_.max([scale(value), 0]), maxBuckets]);
  };

  BuildingBucketCalculator.prototype.toBuckets = function() {
    var self = this;
    return this.buildings.reduce(function(memo, building){
      var value = building.get(self.fieldName);
      if (!value) {return memo;}
      var scaled = self.toBucket(value);
      memo[scaled] = memo[scaled] + 1 || 1;
      return memo;
    }, {});
  };

  return BuildingBucketCalculator;
});

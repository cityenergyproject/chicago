define([
  'underscore',
  'd3'
], function(_, d3) {
  var BuildingColorBucketCalculator = function(buildings, fieldName, buckets, colorStops) {
    this.buildings = buildings;
    this.fieldName = fieldName;
    this.buckets = buckets;
    this.colorStops = colorStops;
  };

  BuildingColorBucketCalculator.prototype.toBucketStops = function() {
    var range = this.colorStops,
        buckets = this.buckets,
        rangeCount = _.max([range.length - 1, 1]),
        domain = _.range(0, buckets, buckets / rangeCount).concat(buckets);
    return _.map(domain, function(bucket) { return _.max([0, bucket - 1]); });
  }

  BuildingColorBucketCalculator.prototype.toGradientStops = function() {
    var range = this.colorStops,
        buckets = this.buckets,
        bucketStops = this.toBucketStops(),
        gradientScale = d3.scale.linear().range(range).domain(bucketStops);
    return _.map(_.range(buckets), gradientScale);
  }

  BuildingColorBucketCalculator.prototype.toCartoCSS = function() {
    var stops = this.toGradientStops(),
        fieldName = this.fieldName,
        fieldValues = this.buildings.pluck(fieldName),
        gradient = d3.scale.quantile().domain(fieldValues).range(stops);
    return _.map(stops, function(stop){
      var min = _.min(gradient.invertExtent(stop));
      return "[" + fieldName + ">=" + min + "]{marker-fill:" + stop + "}";
    });
  };

  BuildingColorBucketCalculator.prototype.toColor = function(value) {
    var stops = this.toGradientStops(),
        fieldValues = this.buildings.pluck(this.fieldName),
        gradient = d3.scale.quantile().domain(fieldValues).range(stops);
    return gradient(value);
  };

  return BuildingColorBucketCalculator;
});

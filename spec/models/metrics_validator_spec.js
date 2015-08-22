var Backbone = require('backbone'),
    _ = require('underscore');

describe("MetricsValidator", function(){
  var MetricsValidator = function(cityFields, metrics, newField) {
    this.cityFields = cityFields;
    this.metrics = metrics;
    this.newField = newField;
  };

  MetricsValidator.prototype.toValidFields = function(){
    var allValidFields = _.intersection(this.metrics.concat([this.newField]), this.cityFields),
        lastValidField = _.last(allValidFields);
    if (allValidFields.length > 5) {
      allValidFields = _.first(allValidFields,4).concat([lastValidField]);
    }
    return allValidFields;
  }

  var subject, cityFields, metrics, newField;

  beforeEach(function(){
    cityFields = ['wheat', 'betamax', 'strawberry', 'sally', 'cookies', 'kangaroos'];
    metrics = [];
    newField = 'betamax';
    subject = new MetricsValidator(cityFields, metrics, newField);
  });

  describe("#toValidFields", function(){
    it("returns the valid fields", function(){
      expect(subject.toValidFields()).toEqual(['betamax']);
    });

    describe("when the new field is not in the city fields", function(){
      it("returns an empty array", function(){
        subject = new MetricsValidator(cityFields, metrics, 'vhs');
        expect(subject.toValidFields()).toEqual([]);
      });
    });

    describe("when there are more than 5 valid fields", function(){
      it("returns the first 4 fields plus the new one", function(){
        metrics = ['wheat', 'strawberry', 'sally', 'cookies', 'kangaroos'];
        subject = new MetricsValidator(cityFields, metrics, 'betamax');
        expect(subject.toValidFields()).toEqual(
          ['wheat', 'strawberry', 'sally', 'cookies', 'betamax']
        );
      });
    });
  });
});

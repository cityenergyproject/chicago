describe("BuildingComparator", function(){
  function BuildingComparator(building, other, field, ascending) {
    this.building = building;
    this.other = other;
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

  BuildingComparator.prototype.compare = function(){
    var a = this.building.get(this.field),
        b = this.other.get(this.field),
        ascending = (this.ascending ? 1 : -1);
    return this.getComparator(a, b)(a, b, ascending);
  };

  var subject, a, b, field, ascending;

  beforeEach(function(){
    ascending = true;
    field = 'strawberry';
  });

  describe("#compare", function(){
    describe("when the values are numerical", function(){
      beforeEach(function(){
        a = {get: function(arg) { return '1.1'; }};
        b = {get: function(arg) { return '2.123123'; }};
        ascending = true;
        field = 'strawberry';
      });

      describe("when the values are equal", function(){
        beforeEach(function(){
          b = {get: function(arg) { return '1.1'; }};
          subject = new BuildingComparator(a, b, 'strawberry', ascending);
        });

        it("returns 0 to say that they are equal", function(){
          expect(subject.compare()).toEqual(0);
        });
      });

      describe("when the first value is smaller", function(){
        describe("when sorting in ascending order", function(){
          beforeEach(function(){
            subject = new BuildingComparator(a, b, 'strawberry', ascending);
          });

          it("returns -1 to say that the first one comes first", function(){
            expect(subject.compare()).toEqual(-1);
          });
        });

        describe("when sorting in descending order", function(){
          beforeEach(function(){
            ascending = false;
            subject = new BuildingComparator(a, b, 'strawberry', ascending);
          });

          it("returns 1 to say that the second one comes first", function(){
            expect(subject.compare()).toEqual(1);
          });
        });
      });

      describe("when the second value is smaller", function(){
        describe("when sorting in ascending order", function(){
          beforeEach(function(){
            subject = new BuildingComparator(b, a, 'strawberry', ascending);
          });

          it("returns 1 to say that the second one comes first", function(){
            expect(subject.compare()).toEqual(1);
          });
        });

        describe("when sorting in descending order", function(){
          beforeEach(function(){
            ascending = false;
            subject = new BuildingComparator(b, a, 'strawberry', ascending);
          });

          it("returns -1 to say that the first one comes first", function(){
            expect(subject.compare()).toEqual(-1);
          });
        });
      });
    });

    describe("when the values are strings", function(){
      beforeEach(function(){
        a = {get: function(arg) { return 'normal'; }};
        b = {get: function(arg) { return 'rotten'; }};
        ascending = true;
        field = 'strawberry';
      });

      describe("when the values are equal", function(){
        beforeEach(function(){
          b = {get: function(arg) { return 'normal'; }};
          subject = new BuildingComparator(a, b, 'strawberry', ascending);
        });

        it("returns 0 to say that they are equal", function(){
          expect(subject.compare()).toEqual(0);
        });
      });

      describe("when the first value is smaller", function(){
        describe("when sorting in ascending order", function(){
          beforeEach(function(){
            subject = new BuildingComparator(a, b, 'strawberry', ascending);
          });

          it("returns a negative value to say that the first one comes first", function(){
            expect(subject.compare()).toBeLessThan(0);
          });
        });

        describe("when sorting in descending order", function(){
          beforeEach(function(){
            ascending = false;
            subject = new BuildingComparator(a, b, 'strawberry', ascending);
          });

          it("returns a positive value to say that the second one comes first", function(){
            expect(subject.compare()).toBeGreaterThan(0);
          });
        });
      });

      describe("when the second value is smaller", function(){
        describe("when sorting in ascending order", function(){
          beforeEach(function(){
            subject = new BuildingComparator(b, a, 'strawberry', ascending);
          });

          it("returns a positive value to say that the second one comes first", function(){
            expect(subject.compare()).toBeGreaterThan(0);
          });
        });

        describe("when sorting in descending order", function(){
          beforeEach(function(){
            ascending = false;
            subject = new BuildingComparator(b, a, 'strawberry', ascending);
          });

          it("returns a negative value to say that the first one comes first", function(){
            expect(subject.compare()).toBeLessThan(0);
          });
        });
      });
    });
  });
});

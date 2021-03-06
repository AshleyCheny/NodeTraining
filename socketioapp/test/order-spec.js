var expect = require("chai").expect;
var rewire = require("rewire");
// var tools = require("../lib/order");
var sinon = require("sinon");

// create the use the order module object
var order = rewire("../lib/order");

// use testing data instead of real inventory data
describe("Ordering Items", function(){
  // set up the test data
  beforeEach(function(){
    this.testData = [
      {
        sku: "AAA",
        qty: "10"
      },
      {
        sku: "BBB",
        qty: "0"
      },
      {
        sku: "CCC",
        qty: "3"
      }
    ];

    this.console = {
      log: sinon.spy()
    };

    this.warehouse = {
      packageAndShip: sinon.stub().yields(10987654321)
    }

    // inject the fake data to the function
    order.__set__("inventoryData", this.testData);
    order.__set__("console", this.console);
    order.__set__("warehouse", this.warehouse);
  });

  it("Logs 'item not found'", function(){
    order.orderItem("ZZZ", 10);
    expect(this.console.log.calledWith("Item - ZZZ not found")).to.equal(true);
  });

  // write the test
  it("order an item when there are enough in stock", function(done){
    var _this = this;
    order.orderItem("CCC", 3, function(){
      expect(_this.console.log.callCount).to.equal(2);
      done();
    });
  });

  describe("Warehouse interaction", function() {

		beforeEach(function() {

			this.callback = sinon.spy();
			order.orderItem("CCC", 2, this.callback);

		});

		it("receives a tracking number", function() {
			expect(this.callback.calledWith(10987654321)).to.equal(true);
		});

		it("calls packageAndShip with the correct sku and quantity", function() {
			expect(this.warehouse.packageAndShip.calledWith("CCC", 2)).to.equal(true);
		});

	});
});

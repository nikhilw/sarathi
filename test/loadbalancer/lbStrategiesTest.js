var chai = require("chai");
chai.should();
var lbStrategies = require("../../loadbalancer/strategies");

function TestDiscoveryHandler(nodes) {
	this.getDiscoveredInstances = function () {
		return nodes;
	}
}

describe("loadbalancer/strategies", function () {
	describe("factory method", function () {
		it("should throw exception for invalid strategy", function () {
			(function () {
				lbStrategies.getLoadBalancer({ strategy: "invalid" }, {});
			}).should.Throw(Error);
		});
	});

	describe("round-robin strategy", function () {
		const conf = { strategy: "round-robin" };

		it("should return nodes in loop", function () {
			const roundRobin = lbStrategies.getLoadBalancer(conf, new TestDiscoveryHandler(["1", "2", "3"]));

			roundRobin.getNextNode().should.be.equal("1");
			roundRobin.getNextNode().should.be.equal("2");
			roundRobin.getNextNode().should.be.equal("3");
			roundRobin.getNextNode().should.be.equal("1");
			roundRobin.getNextNode().should.be.equal("2");
			roundRobin.getNextNode().should.be.equal("3");
		});

		it("should throw error when no nodes found", function () {
			const roundRobin = lbStrategies.getLoadBalancer(conf, new TestDiscoveryHandler([]));
			(function () {
				roundRobin.getNextNode();
			}).should.Throw(Error);
		});
	});

	describe("random strategy", function () {
		const conf = { strategy: "random" };

		it("should throw error when no nodes found", function () {
			const randomStrategy = lbStrategies.getLoadBalancer(conf, new TestDiscoveryHandler([]));
			(function () {
				randomStrategy.getNextNode();
			}).should.Throw(Error);
		});
	});

	describe("disabled strategy", function () {
		const conf = { strategy: "disabled" };

		it("should return same, first, node every time", function () {
			const disabledStrategy = lbStrategies.getLoadBalancer(conf, new TestDiscoveryHandler(["1", "2", "3"]));

			disabledStrategy.getNextNode().should.be.equal("1");
			disabledStrategy.getNextNode().should.be.equal("1");
			disabledStrategy.getNextNode().should.be.equal("1");
			disabledStrategy.getNextNode().should.be.equal("1");
			disabledStrategy.getNextNode().should.be.equal("1");
			disabledStrategy.getNextNode().should.be.equal("1");
		});

		it("should throw error when no nodes found", function () {
			const disabledStrategy = lbStrategies.getLoadBalancer(conf, new TestDiscoveryHandler([]));
			(function () {
				disabledStrategy.getNextNode();
			}).should.Throw(Error);
		});
	});
});


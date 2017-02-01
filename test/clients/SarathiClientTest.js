var chai = require("chai");
chai.should();
var _ = require("lodash");
var sinon = require("sinon");
var proxyquire = require("proxyquire");

var loadBalancerModule = {};
var request = function() {
	this.refFun.call(this, Array.prototype.slice.call(arguments));
};
var SarathiClient = proxyquire("../../clients/SarathiClient", {"../loadbalancer/strategies": loadBalancerModule, "request": request});
var DummyDiscoveryStrategy = require("../helper").DummyDiscoveryStrategy;

describe("SarathiClient", function () {
	var sarathi;
	var discoveryStrategy = new DummyDiscoveryStrategy();
	var sarathiConfig = {
		methods: {
			m1: {},
			m2: {}
		},
		loadBalancer: {
			strategy: "round-robin"
		},
		discoveryStrategy: discoveryStrategy,
		restClient: {
			retry: 2,
			timeout: 2000
		},
		_state: {
			discoveryHandler: discoveryStrategy
		}
	};

	describe("#constructor", function () {
		it("Should trigger discovery and load balancer instances", function () {
			loadBalancerModule.getLoadBalancer = sinon.spy();
			discoveryStrategy.discoverInstances = sinon.spy();

			sarathi = new SarathiClient(sarathiConfig);

			discoveryStrategy.discoverInstances.calledOnce.should.be.true;
			loadBalancerModule.getLoadBalancer.calledOnce.should.be.true;
			loadBalancerModule.getLoadBalancer.calledWith(sarathiConfig.loadBalancer, sarathiConfig._state.discoveryHandler).should.be.true;
		});

		it("should define all methods on the returned client instance", function () {
			sarathi = new SarathiClient(sarathiConfig);

			sarathi.m1.should.be.a("Function");
			sarathi.m2.should.be.a("Function");
		});

		it("should pass all method params to method calls", function () {
			sarathiConfig.methods.testParams = {
				url: "url1",
				httpMethod: "GET",
				headers: {
					param1: "value1"
				},
				queryParams: {
					a: "b"
				},
				timeout: 200
			};
			var sarathi = new SarathiClient(sarathiConfig);
		});
	});

	describe("#newMethodDefaults", function () {
		it("should return a new instance of default configuration", function () {
			var d1 = sarathi.newMethodDefaults();
			var d2 = sarathi.newMethodDefaults();
			d1.should.not.equal(d2);
			d1.should.be.eql(d2);
		});

	});
});

describe("SarathiClient", function () {
	var discoveryStrategy = new DummyDiscoveryStrategy();
	var sarathiConfig = {
		methods: {},
		loadBalancer: {
			strategy: "round-robin"
		},
		discoveryStrategy: discoveryStrategy,
			restClient: {
			retry: 2,
				timeout: 2000
		},
		_state: {
			discoveryHandler: discoveryStrategy
		}
	};



});

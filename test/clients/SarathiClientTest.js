var chai = require("chai");
chai.should();
var _ = require("lodash");
var sinon = require("sinon");
var proxyquire = require("proxyquire");

var loadBalancerModule = {};
var requestError;
var dummyRequest = function() {
	// console.log(arguments);
	dummyRequest.refFun.call(this, Array.prototype.slice.call(arguments));
	return arguments[1](requestError);
};
var SarathiClient = proxyquire("../../clients/SarathiClient", {"../loadbalancer/strategies": loadBalancerModule, "request": dummyRequest});
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
	discoveryStrategy.discoveryDone = function(callback) {
		return callback();
	};

	var nodeUrl = "prefix:";

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

	var loadBalancer = function() {
		return {
			getNextNode: function () {
				return {
					url: nodeUrl
				}
			}
		}
	};

	var sampleMethodParams = {
		url: "url1",
		httpMethod: "GET",
		headers: {
			param1: "value1"
		},
		queryParams: {
			a: "b"
		},
		body: "{'some': 1}"
	};

	dummyRequest.refFun = sinon.spy();

	beforeEach(function () {
	});

	afterEach(function () {
		dummyRequest.refFun.reset()
	});

	it("should pass all parameters provided at initialization to http call", function (done) {
		sarathiConfig.methods.testParams = sampleMethodParams;
		loadBalancerModule.getLoadBalancer = loadBalancer;

		var sarathi = new SarathiClient(sarathiConfig);

		sarathi.testParams(function () {
			var args = dummyRequest.refFun.args[0];
			args[0][0].should.be.eql({
				url: "prefix:url1",
				method: "GET",
				headers: {
					"content-type": 'application/json',
					accept: 'application/json',
					param1: "value1"
				},
				httpMethod: "GET",
				placeholders: {},
				queryParams: {
					a: "b"
				},
				qs: {
					a: "b"
				},
				body: "{'some': 1}",
				timeout: 2000
			});
			done();
		});
	});

	it("should pass all parameters provided at initialization to http call; should return a promise and resolve for success", function () {
		sarathiConfig.methods.testParams = sampleMethodParams;
		loadBalancerModule.getLoadBalancer = loadBalancer;

		var sarathi = new SarathiClient(sarathiConfig);
		sarathi.testParams().then(function () {
			var args = dummyRequest.refFun.args[0];
			args[0][0].should.be.eql({
				url: "prefix:url1",
				method: "GET",
				headers: {
					"content-type": 'application/json',
					accept: 'application/json',
					param1: "value1"
				},
				httpMethod: "GET",
				placeholders: {},
				queryParams: {
					a: "b"
				},
				qs: {
					a: "b"
				},
				body: "{'some': 1}",
				timeout: 2000
			});
			done();
		});
	});

	it("should pass all provided parameters to http call, should accept body of type Object", function (done) {
		var tempBody = sampleMethodParams.body;
		sampleMethodParams.body = {"some": 1};

		sarathiConfig.methods.testParams = sampleMethodParams;
		loadBalancerModule.getLoadBalancer = loadBalancer;

		var sarathi = new SarathiClient(sarathiConfig);

		sarathi.testParams(function () {
			var args = dummyRequest.refFun.args[0];
			args[0][0].should.be.eql({
				url: "prefix:url1",
				method: "GET",
				headers: {
					"content-type": 'application/json',
					accept: 'application/json',
					param1: "value1"
				},
				httpMethod: "GET",
				placeholders: {},
				queryParams: {
					a: "b"
				},
				qs: {
					a: "b"
				},
				json: true,
				body: {"some": 1},
				timeout: 2000
			});
			sampleMethodParams.body = tempBody;
			done();
		});
	});

	it("should pass all provided parameters to http call, should accept body of type Array", function (done) {
		var tempBody = sampleMethodParams.body;
		sampleMethodParams.body = [{"some": 1}];

		sarathiConfig.methods.testParams = sampleMethodParams;
		loadBalancerModule.getLoadBalancer = loadBalancer;

		var sarathi = new SarathiClient(sarathiConfig);

		sarathi.testParams(function () {
			var args = dummyRequest.refFun.args[0];
			args[0][0].should.be.eql({
				url: "prefix:url1",
				method: "GET",
				headers: {
					"content-type": 'application/json',
					accept: 'application/json',
					param1: "value1"
				},
				httpMethod: "GET",
				placeholders: {},
				queryParams: {
					a: "b"
				},
				qs: {
					a: "b"
				},
				json: true,
				body: [{"some": 1}],
				timeout: 2000
			});
			sampleMethodParams.body = tempBody;
			done();
		});
	});

	it("should pass all provided parameters to http call, override with runtime params", function (done) {
		sarathiConfig.methods.testParams = sampleMethodParams;
		loadBalancerModule.getLoadBalancer = loadBalancer;

		var sarathi = new SarathiClient(sarathiConfig);

		sarathi.testParams({
			httpMethod: "POST",
			headers: {
				"content-type": "application/xml"
			}
		}, function () {
			var args = dummyRequest.refFun.args[0];
			args[0][0].should.be.eql({
				url: "prefix:url1",
				method: "POST",
				headers: {
					"content-type": "application/xml",
					accept: 'application/json',
					param1: "value1"
				},
				httpMethod: "POST",
				placeholders: {},
				queryParams: {
					a: "b"
				},
				qs: {
					a: "b"
				},
				body: "{'some': 1}",
				timeout: 2000
			});
			done();
		});
	});

	it("should handle and propagate failures in from discovery", function (done) {
		var origImpl = discoveryStrategy.discoveryDone;
		discoveryStrategy.discoveryDone = function (c, callback) {
			return callback(new Error("Something's gotta give"));
		};

		sarathiConfig.methods.testParams = sampleMethodParams;
		loadBalancerModule.getLoadBalancer = loadBalancer;

		var sarathi = new SarathiClient(sarathiConfig);

		sarathi.testParams(function (err, res, body) {
			err.should.be.ok;
			err.should.be.an.instanceOf(Error);
			err.message.should.be.eql("Something's gotta give");
			discoveryStrategy.discoveryDone = origImpl;
			done();
		});
	});

	it("should handle and propagate failures in from discovery, only when there are no nodes to use.", function () {
		// var origImpl = discoveryStrategy.discoveryDone;
		// discoveryStrategy.discoveryDone = function (c, callback) {
		// 	return callback(new Error("Something's gotta give"));
		// };
        //
		// sarathiConfig.methods.testParams = sampleMethodParams;
		// loadBalancerModule.getLoadBalancer = loadBalancer;
        //
		// var sarathi = new SarathiClient(sarathiConfig);
        //
		// sarathi.testParams(function (err, res, body) {
		// 	err.should.be.ok;
		// 	err.should.be.an.instanceOf(Error);
		// 	err.message.should.be.eql("Something's gotta give");
		// 	discoveryStrategy.discoveryDone = origImpl;
		// 	done();
		// });
	});

	it("should retry till retry count, when error occurs", function (done) {
		requestError = new Error("failure in request.");
		var sarathi = new SarathiClient(sarathiConfig);

		sarathi.testParams(function (err, res, body) {
			dummyRequest.refFun.calledThrice.should.be.true;
			err.should.be.ok;
			err.should.be.an.instanceOf(Error);
			err.message.should.be.eql("failure in request.");
			requestError = undefined;
			done();
		});
	});

	it("should retry till retry count, when error occurs, should return a promise and reject for error", function () {
		requestError = new Error("failure in request.");
		var sarathi = new SarathiClient(sarathiConfig);

		sarathi.testParams().then(_.noop, function (err) {
			dummyRequest.refFun.calledThrice.should.be.true;
			err.should.be.ok;
			err.should.be.an.instanceOf(Error);
			err.message.should.be.eql("failure in request.");
			requestError = undefined;
			done();
		});
	});
});

var chai = require("chai");
chai.should();

var SarathiBuilder = require("../../clients/SarathiClientBuilder");
var SarathiClient = require("../../clients/SarathiClient");
var DummyDiscoveryStrategy = require("../helper").DummyDiscoveryStrategy;

describe("SarathiClientBuilder", function () {
	var sarathiBuilder;

	beforeEach(function () {
		sarathiBuilder = new SarathiBuilder({
			discoveryStrategy: new DummyDiscoveryStrategy()
		});
	});

	it("should be instantiated even when new keyword is not used", function () {
		var sb = SarathiBuilder();
		sb.should.be.an.instanceOf(SarathiBuilder);
	});

	it("#setConfig should return builder back for chainability", function () {
		sarathiBuilder.setConfig({}).should.be.an.instanceOf(SarathiBuilder);
	});

	it("#addMethod should return builder back for chainability", function () {
		sarathiBuilder.addMethod("some", {}).should.be.an.instanceOf(SarathiBuilder);
		sarathiBuilder._globalConfig.methods.some.should.be.ok;
	});

	it("#addMethod should accept all method options as second param", function () {
		var methodOptions = {headers: {a: 1}, additional: {some: "value"}};
		sarathiBuilder.addMethod("aMethod", methodOptions)._globalConfig.methods.aMethod.should.equal(methodOptions);
	});

	it("#addMethod should accept just url as second param", function () {
		var methodUrl = "url1";
		var methodOptions = {};
		methodOptions.url = methodUrl;

		sarathiBuilder.addMethod("aMethod", methodUrl)._globalConfig.methods.aMethod.should.eql(methodOptions);
	});

	it("#setMethods should return builder back for chainability", function () {
		sarathiBuilder.setMethods({}).should.be.an.instanceOf(SarathiBuilder);
	});

	it("#setMethods should overwrite all methods set so far", function () {
		var methods = {
			m1: {url: "1"},
			m2: {headers: {s: "1"}, url: "2"}
		};

		sarathiBuilder
			.addMethod("aMethod", "url1")
			.addMethod("secondMethod", "url2")
			.setMethods(methods)
			._globalConfig.methods.should.be.eql(methods);
	});

	it("#setRestClientConfig should return builder back for chainability", function () {
		sarathiBuilder.setRestClientConfig({}).should.be.an.instanceOf(SarathiBuilder);
	});

	it("#setRetryCount should return builder back for chainability", function () {
		sarathiBuilder.setRetryCount(1).should.be.an.instanceOf(SarathiBuilder);
	});

	it("#setLoadBalanceStrategy should return builder back for chainability", function () {
		sarathiBuilder.setLoadBalanceStrategy("round-robin").should.be.an.instanceOf(SarathiBuilder);
	});

	it("#setDiscoveryStrategy should return builder back for chainability", function () {
		sarathiBuilder.setDiscoveryStrategy(new DummyDiscoveryStrategy()).should.be.an.instanceOf(SarathiBuilder);
	});

	it("#setDiscoveryStrategy should verify instance type", function () {
		function A(){}
		(function () {
			sarathiBuilder.setDiscoveryStrategy(new A());
		}).should.Throw(Error, "discoveryStrategy must be an instace of DiscoveryStrategy from sarathi-discovery-strategy package.");
	});

	it("#newMethodDefaults should return a new instance of default configuration", function () {
		var d1 = sarathiBuilder.newMethodDefaults();
		var d2 = sarathiBuilder.newMethodDefaults();
		d1.should.not.equal(d2);
		d1.should.be.eql(d2);
	});

	it("#build should return instance of ", function () {
		sarathiBuilder.build().should.be.an.instanceOf(SarathiClient);
	});

	it("#build should verify discovery strategy is provided", function () {
		(function () {
			new SarathiBuilder({
				discoveryStrategy: undefined
			}).build();
		}).should.Throw(Error, "discoveryStrategy must be an instace of DiscoveryStrategy from sarathi-discovery-strategy package.");
	});

	it("#build should verify instance type of discovery strategy", function () {
		function A(){}
		(function () {
			new SarathiBuilder({
				discoveryStrategy: new A()
			}).build();
		}).should.Throw(Error, "discoveryStrategy must be an instace of DiscoveryStrategy from sarathi-discovery-strategy package.");
	});

	it("#build should verify instance type of discovery strategy, when an attempt to bypass validation", function () {
		function A(){}
		(function () {
			new SarathiBuilder({
				_state: {
					discoveryHandler: new A()
				}
			}).build();
		}).should.Throw(Error, "discoveryStrategy must be an instace of DiscoveryStrategy from sarathi-discovery-strategy package.");
	});
});

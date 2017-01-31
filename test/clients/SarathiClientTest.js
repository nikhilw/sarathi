var chai = require("chai");
chai.should();
var _ = require("lodash");

var SarathiClient = require("../../clients/SarathiClient");
var DummyDiscoveryStrategy = require("../helper").DummyDiscoveryStrategy;

describe("SarathiClient", function () {
	var sarathi;
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

	beforeEach(function () {
		sarathi = new SarathiClient(sarathiConfig);
	});

	it("#newMethodDefaults should return a new instance of default configuration", function () {
		var d1 = sarathi.newMethodDefaults();
		var d2 = sarathi.newMethodDefaults();
		d1.should.not.equal(d2);
		d1.should.be.eql(d2);
	});

	it("should define all methods on the retruned client", function () {
		var config = _.merge({}, sarathiConfig, {methods: {
			m1: {},
			m2: {}
		}});

		var localSarathi = new SarathiClient(config);
		localSarathi.m1.should.be.ok;
		localSarathi.m2.should.be.ok;
	});

});

var util = require("util");
var DiscoveryStrategy = require("sarathi-discovery-strategy");

function DummyDiscoveryStrategy() {
}

util.inherits(DummyDiscoveryStrategy, DiscoveryStrategy);

DummyDiscoveryStrategy.prototype.discoverInstances = function() {
};

DummyDiscoveryStrategy.prototype.discoveryDone = function() {
};

DummyDiscoveryStrategy.prototype.getDiscoveredInstances = function() {
};

module.exports = {
	DummyDiscoveryStrategy: DummyDiscoveryStrategy
};

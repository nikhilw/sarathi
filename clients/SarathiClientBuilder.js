// @flow
"use strict";
var _ = require("lodash");
var SarathiClient = require("./SarathiClient");
var methodDefaults = require("../commons/defaults").methodDefaults;
var DiscoveryStrategy = require("sarathi-discovery-strategy");

var globalDefaults = {
	methods: {}, // methods to define on this client and their endpoints and other parameters
	loadBalancer: { // Load balancer config
		strategy: "round-robin" // random, disabled
	},
	discoveryStrategy: undefined,
	restClient: { // Rest client config
		retry: 2, // number of retries on failure before returning error; value 2 means: 1 + 2 = 3 max calls.
		timeout: 2000 // REST call timeout
	},
	_state: {}
};

function SarathiClientBuilder(options) {
    var instance = this;
    if (!(this instanceof SarathiClientBuilder)) {
        return new SarathiClientBuilder(options);
    }

    var globalConfig = {};
	_.merge(globalConfig, globalDefaults, options);

	// Enable testing of properties
	if (process.env.NODE_ENV === "test") {
		instance._globalConfig = globalConfig;
	}

    this.setConfig = function(options) {
        _.merge(globalConfig, globalDefaults, options);
        return this;
    };

    this.addMethod = function(methodName, options) {
        var methodOptions;
        if (_.isString(options)) {
			methodOptions = {url: options};
        } else {
			methodOptions = options;
        }

        globalConfig.methods[methodName] = methodOptions;
        return this;
    };

	this.setMethods = function(methodConfig) {
		globalConfig.methods = methodConfig;
		return this;
	};

	this.setRestClientConfig = function(restClientConfig) {
		globalConfig.restClient = restClientConfig;
		return this;
	};

	this.setRetryCount = function(retryCount) {
		globalConfig.restClient.retry = retryCount;
		return this;
	};

    this.setLoadBalanceStrategy = function(strategy) {
        globalConfig.loadBalancer.strategy = strategy;
        return this;
    };

	this.setDiscoveryStrategy = function(discoveryStrategyInst) {
		if (!(discoveryStrategyInst instanceof DiscoveryStrategy)) {
			throw new Error("discoveryStrategy must be an instace of DiscoveryStrategy from sarathi-discovery-strategy package.");
		}
		globalConfig._state.discoveryHandler = discoveryStrategyInst;
		return this;
	};

	this.newMethodDefaults = function() {
        return _.merge({}, methodDefaults);
    };

    this.build = function() {
		if (globalConfig.discoveryStrategy && globalConfig.discoveryStrategy instanceof DiscoveryStrategy) {
			globalConfig._state.discoveryHandler = globalConfig.discoveryStrategy;
		}

		// Only if someone tries to sneak past.
		if (!(globalConfig._state.discoveryHandler instanceof DiscoveryStrategy)) {
			throw new Error("discoveryStrategy must be an instace of DiscoveryStrategy from sarathi-discovery-strategy package.");
		}

        return new SarathiClient(globalConfig);
    };
}

module.exports = SarathiClientBuilder;

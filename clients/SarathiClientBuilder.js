// @flow
"use strict";
var _ = require("lodash");
var SarathiClient = require("./SarathiClient");
var methodDefaults = require("../commons/defaults").methodDefaults;
var DiscoveryBuilder = require("../discovery/strategies").DiscoveryBuilder;

var globalDefaults = {
	methods: {}, // methods to define on this client and their endpoints and other parameters
	loadBalancer: { // Load balancer config
		strategy: "round-robin" // random, disabled
	},
	discovery: { // Service discovery config
		serviceId: "test-service", // name of your service
		serverType: "consul", // direct, [eureka, coming]
		client: undefined, // instance of service discovery client
		clientConfig: {}, // configuration to create disovery client instance: server ip, port etc
		refreshRate: 30000, // timeout to refresh services from discovery server
		zone: undefined, // data-center or zone of preference
		instances: undefined // ["url1", "url2"]
	},
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

    if (options) {
        instance.setConfig(options);
    }

    function setConfig(options) {
        _.merge(globalConfig, globalDefaults, options);
		// TODO: call DiscoveryBuilder
        return this;
    }

    function addMethod(methodName, options) {
        var methodOptions;
        if (_.isString(options)) {
            // _.merge(methodOptions, methodDefaults, {url: options});
			methodOptions = {url: options};
        } else {
            // _.merge(methodOptions, methodDefaults, options);
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

    function setLoadBalanceStrategy(strategy) {
        globalConfig.loadBalancer.strategy = strategy;
        return this;
    }

    function getDiscoveryBuilder(serverType) {
        globalConfig.discovery.serverType = serverType || globalConfig.discovery.serverType;
        return new DiscoveryBuilder(globalConfig.discovery, this);
    }

	this.newMethodDefaults = function() {
        return _.merge({}, methodDefaults);
    };

    function build() {
        var client = new SarathiClient(globalConfig);
        return client;
    };

    this.addMethod = addMethod;
    this.build = build;
    this.setConfig = setConfig;
    this.setLoadBalanceStrategy = setLoadBalanceStrategy;
    this.getDiscoveryBuilder = getDiscoveryBuilder;

    this._setDiscoveryHandler = function(discoveryHandler) {
        globalConfig._state.discoveryHandler = discoveryHandler;
    };
};

module.exports = SarathiClientBuilder;

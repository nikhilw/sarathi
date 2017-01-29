"use strict";
var _ = require("lodash");
var request = require("request");
var format = require("string-format");

var loadBalancerStrategies = require("../loadbalancer/strategies");

var methodDefaults = require("../commons/defaults").methodDefaults;

function methodBuilder(methodOptions, restClientConfig, _instanceState) {
	// console.log("original: ", methodOptions);
	var cleanedUpMethodOptions = _.merge({}, methodDefaults, methodOptions);
    return function(optionOverrides, callback) {
        if (_.isFunction(optionOverrides)) {
            callback = optionOverrides;
        }
		// console.log("cleanedUpMethodOptions: ", cleanedUpMethodOptions);
		// console.log(_instanceState.discoveryHandler.getDiscoveredInstances().length);

        _instanceState.discoveryHandler.discoveryDone(function() {
			var responseObject = {};
			var effectiveMethodOptions = _.merge({}, cleanedUpMethodOptions, optionOverrides || {});
			// console.log("effective: ", effectiveMethodOptions);
            invokeEndpoint(restClientConfig.retry, responseObject, effectiveMethodOptions, _instanceState, restClientConfig, function() {
				// console.log("got response: " + responseObject);
                return callback(responseObject.error, responseObject.response, responseObject.body);
            });
        }, function(err) {
            return callback(err);
        });
    };
}

function massageBody(requestOptions) {
	var body = requestOptions.body;
	if (_.isPlainObject(body) || _.isArray(body)) {
		requestOptions.json = true;
	}
}

function invokeEndpoint(retryCount, responseObject, methodOptions, _instanceState, restClientConfig, callback) {
	var url = _instanceState.lbStrategy.getNextNode().url + methodOptions.url;
	url = url.replace(/([^:]\/)\/+/g, "$1");
    url = format(url, methodOptions.placeholders);

	var requestOptions = {
        // url: config.strategy.getNextNode().url + methodOptions.url,
        url: url,
        method: methodOptions.httpMethod || "GET",
        headers: methodOptions.headers,
        qs: methodOptions.queryParams,
        body: methodOptions.body,
        timeout: restClientConfig.timeout // TODO: option
    };
	massageBody(requestOptions);
	// console.log(requestOptions);


	request(requestOptions, function(error, response, body) {
        responseObject.error = error;
        responseObject.response = response;
        responseObject.body = body;
        // if (error) {
        //     -- retryCount;
        // } else {
        //     retryCount = 0;
        //     e = error;
        //     r = response;
        //     b = body;
        // }

        // console.log("response: " + responseObject.error + "rc:" + retryCount);
        if (responseObject.error && retryCount > 0) {
            console.log("error occured, retrying: " + responseObject.error);
            return invokeEndpoint(--retryCount, responseObject, methodOptions, _instanceState, restClientConfig, callback);
        } else {
			return callback(responseObject);
		}
    });
}

function SarathiClient(globalConfig) {
    var sarathiClient = this;
	// sarathiClient._globalConfig = globalConfig;

    globalConfig._state.discoveryHandler.discoverInstances();
    globalConfig._state.lbStrategy = loadBalancerStrategies.getLoadBalancer(globalConfig.loadBalancer, globalConfig._state.discoveryHandler);

    _.forEach(globalConfig.methods, function(methodOptions, methodName) {
        sarathiClient[methodName] = methodBuilder(methodOptions, globalConfig.restClient, globalConfig._state);
    });

    this.newMethodDefaults = function() {
        return _.merge({}, methodDefaults);
    };
};

module.exports = SarathiClient;

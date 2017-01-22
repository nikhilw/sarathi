"use strict";
var _ = require("lodash");
var consul = require('consul')();
var request = require("request");
var Promise = require('promise');

var loadBalancerStrategies = require("../loadbalancer/strategies.js");

var defaults = {};
var methodDefaults = {
    resolve: {},
    queryParams: {},
    headers: {},
    body: undefined
};

function discoverService(serviceId) {
    var serviceDiscovery = {
        nodes: [],
        status: new Promise(
            function(resolve, reject) {
                consul.health.service({
                    service: serviceId,
                    passing: true
                }, function(err, result) {
                    if (err) {
                        return reject(err);
                    }

                    // console.log(result);
                    if (result.length) {
                        _.forEach(result, function(serviceDetails) {
                            //console.log(serviceDetails);
                            serviceDiscovery.nodes.push({
                                address: serviceDetails.Service.Address,
                                port: serviceDetails.Service.Port,
                                url: "http://" + serviceDetails.Service.Address + ":" + serviceDetails.Service.Port + "/"
                            })
                        });
                        // console.log(serviceDiscovery.nodes);
                        return resolve(serviceDiscovery.nodes);
                    } else {
                        return reject("no services found");
                    }
                });

                // setTimeout(function() {
                //     reject("timeout");
                // }, 2000);
            }
        )
    };
    return serviceDiscovery;
}

function methodBuilder(methodOptions, config) {
    return function(optionOverrides, callback) {
        if (_.isFunction(optionOverrides)) {
            callback = optionOverrides;
        } else {
            //TODO: use overrides
        }

        config.serviceDiscovery.status.done(function() {
            invokeEndpoint(config.retry, {}, methodOptions, config, function() {
                return callback(responseObject.error, responseObject.response, responseObject.body);
            });
        }, function(err) {
            return callback(err);
        });
    }
}

function invokeEndpoint(retryCount, responseObject, methodOptions, config, callback) {
    // do while wont work in this case, needs a better handling, especially for async!
    var testUrl = config.strategy.getNextNode().url + methodOptions.url;
    console.log(testUrl);
    request({
        // url: config.strategy.getNextNode().url + methodOptions.url,
        url: testUrl,
        method: methodOptions.method || "GET",
        headers: methodOptions.headers,
        qs: methodOptions.queryParams,
        body: methodOptions.body,
        timeout: 2000 //TODO: option
    }, function(error, response, body) {
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
            return invokeEndpoint(--retryCount, responseObject, methodOptions, config, callback);
        }
    });
}

function VascoClient(options) {
    var vascoClient = this;
    var config = {};
    _.merge(config, defaults, options);

    config.serviceDiscovery = discoverService(config.serviceId); //TODO: use a promise to block till first discovery.
    config.strategy = loadBalancerStrategies.getLoadBalancer(config);
    
    _.forEach(config.methods, function(methodOptions, methodName) {
        vascoClient[methodName] = methodBuilder(methodOptions, config);
    });

    this.newDummyOptions = function() {
        return _.merge({}, methodDefaults);
    };
};

module.exports = VascoClient;

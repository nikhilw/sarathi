"use strict";

var _ = require("lodash");
var consul = require("consul");
var Promise = require("promise");

var discoveries = {
    consul: ConsulClient,
    direct: DirectClient
};

function ConsulClient(discoveryConfig) {
    var instance = this;
    var client = discoveryConfig.client || consul(discoveryConfig.clientConfig);

    setInterval(function() {
        instance.discoverService();
    }, discoveryConfig.refreshRate);

    this.discoverService = function() {
        var serviceDiscovery = {
            nodes: [],
            status: new Promise(
                function(resolve, reject) {
                    client.health.service({
                        service: discoveryConfig.serviceId,
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

                    setTimeout(function() {
                        reject("timeout");
                    }, 15000);
                }
            )
        };

        return serviceDiscovery;
    };
}

function DirectClient(discoveryConfig) {
    // var instance = this;
    this.discoverService = function() {
        var serviceDiscovery = {
            nodes: discoveryConfig.instances.slice(),
            status: new Promise(
                function(resolve, reject) {
                    return resolve(serviceDiscovery.nodes);
                }
            )
        };

        return serviceDiscovery;
    };
}

function DiscoveryBuilder(config, wrapperRef) {
    var DiscoveryHandlerBuilder = discoveries[config.discovery];
    if (!DiscoveryHandlerBuilder) {
        throw new Error("Discoery type specified is not supported: " + config.discovery);
    }

    var discoveryConfig = {};
    discoveryConfig.serviceId = config.serviceId;

    this.setClient = function(discoveryClient) {
        discoveryConfig.client = discoveryClient;
        return this;
    };

    this.setClientConfig = function(clientConfig) {
        discoveryConfig.clientConfig = clientConfig;
        return this;
    };

    this.setRefreshRate = function(refreshRate) {
        discoveryConfig.refreshRate = refreshRate;
        return this;
    };

    this.setServiceId = function(serviceId) {
        // TODO: implement. make discoveryConfig a subset of config; rename it to globalConfig
    };

    this.setDirectInstances = function(instances) {
        discoveryConfig.instances = instances;
        return this;
    };

    this.build = function() {
        wrapperRef._setDiscoveryHandler(new DiscoveryHandlerBuilder(discoveryConfig));
        return wrapperRef;
    };
}

module.exports = {
    DiscoveryBuilder: DiscoveryBuilder
};

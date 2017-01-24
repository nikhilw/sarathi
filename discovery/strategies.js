// @flow
"use strict";

var _ = require("lodash");
var consul = require("consul");
var Promise = require("promise");

var discoveryServerClients = {
    consul: ConsulClient,
    direct: DirectClient
};

function ConsulClient(discoveryConfig) {
	if (!discoveryConfig.serviceId) {
		throw new Error("serviceId must be defined for service discovery");
	}

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
                        passing: true,
						dc: discoveryConfig.zone
                    }, function(err, result) {
                        if (err) {
                            return reject(err); // TODO: Log an error
                        }

                        // console.log(result);
                        if (result.length) {
                            _.forEach(result, function(serviceDetails) {
                                // console.log(serviceDetails);
                                serviceDiscovery.nodes.push({
                                    address: serviceDetails.Service.Address,
                                    port: serviceDetails.Service.Port,
                                    url: "http://" + serviceDetails.Service.Address + ":" + serviceDetails.Service.Port + "/"
                                });
                            });
                            // console.log(serviceDiscovery.nodes);
                            return resolve(serviceDiscovery.nodes);
                        } else {
                            return reject("no services found");
                        }
                    });

                    setTimeout(function() {
                        reject("timeout"); // TODO: Log an error
                    }, 15000);
                }
            )
        };

        return serviceDiscovery;
    };
}

function DirectClient(discoveryConfig) {
	if (!_.isArray(discoveryConfig.instances)) {
		throw new Error("instances must be defined for direct discovery");
	}

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

function DiscoveryBuilder(discoveryConfig, wrapperRef) {
    var DiscoveryHandlerBuilder = discoveryServerClients[discoveryConfig.serverType];
    if (!DiscoveryHandlerBuilder) {
        throw new Error("Discovery type specified is not supported: " + discoveryConfig.serverType);
    }

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
        discoveryConfig.serviceId = serviceId;
		return this;
    };

    this.setDirectInstances = function(instances) {
        discoveryConfig.instances = instances;
        return this;
    };

	this.setZone = function(zone) {
		discoveryConfig.zone = zone;
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

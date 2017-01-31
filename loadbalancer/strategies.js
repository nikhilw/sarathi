// @flow
"use strict";
var _ = require("lodash");

function RoundRobin(loadBalancer, discoveryHandler) {
    var nodes = discoveryHandler.getDiscoveredInstances();
    var current = 0;

    this.getNextNode = function() {
		// console.log("getNextNode: " + nodes.length);
        if (nodes.length) {
            return nodes[(current++ % nodes.length)];
        }
        throw new Error("No nodes found for service.");
    };
}

function Random(loadBalancer, discoveryHandler) {
    var nodes = discoveryHandler.getDiscoveredInstances();

    this.getNextNode = function() {
        if (nodes.length) {
            return nodes[(Math.floor(Math.random() * nodes.length))];
        }
        throw new Error("No nodes for service.");
    };
}

function DisabledLB(loadBalancer, discoveryHandler) {
    var nodes = discoveryHandler.getDiscoveredInstances();

    this.getNextNode = function() {
        if (nodes.length) {
            return nodes[0];
        }
        throw new Error("No nodes for service.");
    };
}

var loadBalanceStrategies = {
    "round-robin": RoundRobin,
    "random": Random,
    "disabled": DisabledLB
};

module.exports = {
    getLoadBalancer: function(loadBalancer, discoveryHandler) {
        var StrategyHandler = loadBalanceStrategies[loadBalancer.strategy];
        if (!StrategyHandler) {
            throw new Error("Invalid load balancing strategy: " + loadBalancer.strategy);
        }

        return new StrategyHandler(loadBalancer, discoveryHandler);
    }
};

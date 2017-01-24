// @flow
"use strict";
var _ = require("lodash");

function Strategy() {
    this.getNextNode = _.noop;
};

function RoundRobin(loadBalancer, serviceDiscovery) {
    var nodes = serviceDiscovery.nodes;
    var current = 0;

    this.getNextNode = function() {
        if (nodes.length) {
            return nodes[(current++ % nodes.length)];
        }
        throw new Error("No nodes for service.");
    };
}

function Random(loadBalancer, serviceDiscovery) {
    var nodes = serviceDiscovery.nodes;

    this.getNextNode = function() {
        if (nodes.length) {
            return nodes[(Math.floor(Math.random() * nodes.length))];
        }
        throw new Error("No nodes for service.");
    };
}

function DisabledLB(loadBalancer, serviceDiscovery) {
    var nodes = serviceDiscovery.nodes;

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
    getLoadBalancer: function(loadBalancer, serviceDiscovery) {
        var StrategyHandler = loadBalanceStrategies[loadBalancer.strategy];
        if (StrategyHandler === null) {
            throw new Error("Invalid load balancing strategy: " + loadBalancer.strategy);
        }

        return new StrategyHandler(loadBalancer, serviceDiscovery);
    }
};

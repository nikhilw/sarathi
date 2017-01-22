"use strict";
var _ = require("lodash");

function Strategy() {
    this.getNextNode = _.noop;
};

function RoundRobin(options) {
    var nodes = options.serviceDiscovery.nodes;
    var current = 0;
    
    this.getNextNode = function() {
        if (nodes.length) {
            return nodes[(current++ % nodes.length)];
        }
        throw new Error("No nodes for service.");
    }
}

function Random(options) {
    var nodes = options.serviceDiscovery.nodes;
    var current = 0;
    
    this.getNextNode = function() {
        if (nodes.length) {
            return nodes[(Math.floor(Math.random() * nodes.length))];
        }
        throw new Error("No nodes for service.");
    }
}

var strategies = {
    "round-robin": RoundRobin,
    "random": Random
}

module.exports = {
    getLoadBalancer: function(config) {
        var StrategyHandler = strategies[config.strategy];
        if (StrategyHandler === null) {
            throw new Error("Invalid strategy: " + strategy);
        }

        return new StrategyHandler(config);
    }
};
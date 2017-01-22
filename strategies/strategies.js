"use strict";

var roundrobin = require("./roundrobin");
var strategies = {
    roundrobin: roundrobin
}

module.exports = {
    getInstance: function(strategy) {
        var strategyHandler = strategies[strategy];
        if (strategyHandler === null) {
            throw new Error("Invalid strategy: " + strategy);
        }

        return strategyHandler();
    }
};
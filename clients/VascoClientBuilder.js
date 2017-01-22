"use strict";
var _ = require("lodash");
var VascoClient = require("./VascoClient");

var defaults = {
    serviceId: "test-service",
    retry: 3,
    strategy: "round-robin",
    discovery: "consul",
    methods: {
        // test: {
        //     method: "GET",
        //     url: "/sample/test",
        //     consumes: "application/json",
        //     accepts: "application/json",
        //     // handler: function(error, response, body) {
        //     //     console.log(body)
        //     // }
        // },
        // sample: {
        //     method: "GET",
        //     url: "/sample/",
        //     consumes: "application/json",
        //     accepts: "application/json",
        //     // handler: function(error, response, body) {}
        // }
    }
};
    

function VascoClientBuilder(options) {
    var config = {};
    //_.merge(config, defaults, options);

    function setConfig(options) {
        _.merge(config, defaults, options);
        return this;
    }

    function addMethod(methodName, options) {
        var methodOptions = {};
        if (_.isString(options)) {
            _.merge(methodOptions, {url: options});
        } else {
            _.merge(methodOptions, options);
        }
        config.methods[methodName] = methodOptions;
        return this;
    };

    function setLoadBalanceStrategy(strategy) {
        config.strategy = strategy;
        return this;
    }

    function build() {
        var client = new VascoClient(config);
        return client;
    };

    this.addMethod = addMethod;
    this.build = build;
    this.setConfig = setConfig;
};

module.exports = VascoClientBuilder;

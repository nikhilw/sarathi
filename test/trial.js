"use strict";

var VascoClientBuilder = require("../index.js");
var clientBuilder = new VascoClientBuilder();

var client = clientBuilder
                .setConfig({
                    serviceId: "test-service-1",
                    retry: 3,
                    strategy: "round-robin",
                    discovery: "consul"
                })
                //.setDiscovery() // insert an instance of vasco-discoery
                .addMethod("getUsers", "/users", function(e, r, b) {
                    console.log(b);
                })
                .addMethod("getUser", {url: "/user/{id}", consumes: "application/json"}, function(e, r, b) {
                    console.log(b);
                })
                .build();

client.getUsers({}, function(e, r, b) {
    console.log(b);
});
client.getUser({}, function(e, r, b) {
    console.log(b);
});
client.getUsers({}, function(e, r, b) {
    console.log(b);
});
client.getUser({}, function(e, r, b) {
    console.log(b);
});

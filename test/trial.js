"use strict";

var SarathiClientBuilder = require("../index.js");
var clientBuilder = new SarathiClientBuilder();

var client = clientBuilder.setConfig({
		discovery: { // Service discovery config
			serviceId: "express-service",
			serverType: "consul" // direct
		},
		restClient: {
			retry: 2 // total invocations: 1 + 2
		},
        loadBalancer: { // Load balancer config
			strategy: "round-robin" // random, disabled
		} // random, disabled (disable logic, use server side load balancing instead)
    })
    .getDiscoveryBuilder("consul") // direct, overrides config.
    // .setClient(consulClient) // Set existing instance, if you have one.
    .setClientConfig({}) // pass config to create discovery client instance
    .setRefreshRate(3000) // ms
    .build()
    .addMethod("getUsers", "/users")
    .addMethod("getUser", { url: "/users/{id}", headers: {accept: "text/html" }})
    .build();

client.getUsers({}, function(e, r, b) {
    console.log(b);
});
client.getUser({ placeholders: { id: 4 }, headers: {"accept": "application/json", someElse: "value"}}, function(e, r, b) {
    console.log(b);
});
client.getUsers({httpMethod: "POST", body: {v: "some body"}, queryParams: {a: 1, b: 2}}, function(e, r, b) {
    console.log(b);
});
client.getUsers({httpMethod: "POST", body: JSON.stringify({v: "some body"})}, function(e, r, b) {
    console.log(b);
});
client.getUser({ placeholders: { id: 1 } }, function(e, r, b) {
    console.log(b);
});

setInterval(function() {
    client.getUsers({}, function(e, r, b) {
        console.log(b);
    });
    client.getUser({ placeholders: { id: 2 } }, function(e, r, b) {
        console.log(b);
    });
}, 4000);

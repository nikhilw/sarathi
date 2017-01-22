# vasco
Service discovery aware rest client with client side load balancing.

### NOTE: This is still development but basic happy flow with least options is working; check: test/trial.js

### Sample usage:
```
"use strict";

var VascoClientBuilder = require("../index.js");
var clientBuilder = new VascoClientBuilder();

var client = clientBuilder
                .setConfig({
                    serviceId: "test-service-1",
                    retry: 3, // total invocations: 1 + 3
                    strategy: "round-robin", // random, disabled (disable logic, use server side load balancing instead)
                    discovery: "consul" //direct
                })
                .getDiscoveryBuilder("consul") //direct, overrides config.
                    // .setClient(consulClient) // Set existing instance, if you have one.
                    .setClientConfig({}) // pass config to create discovery client instance
                    .setRefreshRate(3000) //ms
                    .build()
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
client.getUser({placeholders: {id: 4}}, function(e, r, b) {
    console.log(b);
});
client.getUsers({}, function(e, r, b) {
    console.log(b);
});
client.getUser({placeholders: {id: 1}}, function(e, r, b) {
    console.log(b);
});

setInterval(function() {
    client.getUsers({}, function(e, r, b) {
        console.log(b);
    });
    client.getUser({placeholders: {id: 2}}, function(e, r, b) {
        console.log(b);
    });
}, 4000);
```

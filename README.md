# Sarathi
Service discovery aware declarative rest client with client side load balancing.
The client is modelled similar to Feign (spring-cloud-feign) and Ribbon (spring-cloud-ribbon) projects from Netflix for simiar purpose.

### NOTE: named as such or not, this software is still alpha!

### Sample usage:
```
"use strict";

var SarathiClientBuilder = require("../index.js");
var clientBuilder = new SarathiClientBuilder();

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

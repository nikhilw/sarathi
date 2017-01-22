# vasco
Service discovery aware rest client with client side load balancing.

### NOTE: This is still development but basic happy flow with least options is working; check: test/trial.js

### Sample usage:
```
var VascoClientBuilder = require("../index.js");
var clientBuilder = new VascoClientBuilder();

var client = clientBuilder
                .setConfig({
                    serviceId: "test-service-1",
                    retry: 3,
                    strategy: "round-robin",
                    discovery: "consul"
                })
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
```

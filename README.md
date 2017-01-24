# Sarathi

Service discovery aware declarative rest client with client side load balancing.

Copyright (c) 2017 Nikhil Wanpal(nikhilw), Licensed under the MIT-LICENSE

Sarathi is a rest client for microservices. It is modelled similar to probably the most popular rest client of this sort in Java world: Feign (spring-cloud-feign) and its load balancer: Ribbon (spring-cloud-ribbon), both from Netflix and fall under spring cloud project.

### NOTE: named as such or not, this software is still alpha!

## Installing
```
npm install --save sarathi
```

## Features
* Supports **service discovery** via Consul.io and direct declaration (if no discovery used).
* Supports **cilent-side load-balancing** via round-robin, random strategies. Can be disabled to allow **server-side load balancing**.
* **Declarative** methods and endpoints mappings
* Invocation time overrides to reuse method calls
* Instantiate with a single object or using a **fluent API**.
* Unicorns

## Usage
```
var SarathiClientBuilder = require("sarathi");
var testServiceClient = new SarathiClientBuilder().setConfig(options).build();
```

**NOTE: [API](#API) is much more fun**
#### Options
* methods: ```Object``` declaring method name, endpoint they refer to, http method etc.
* loadBalancer: ```Object``` Load balancer configuration
* discovery: ```Object``` Service discoery configuration
* restClient: ```Object``` Rest client configuration

#### methods
Object of method description objects. Key of the object is your method name: Ex: getUsers

* url: ```String``` Corresponding http endpoint, can have placeholders. Ex: /users OR /users/{id}
* httpMethod: ```String``` HTTP method, Ex: "GET"
* placeholders: ```Object``` a map of values to resolve placeholders, should ideally be passed while invoking the method instead. Ex: {id: 1}
* queryParams: ```Object``` all attributes of this object are passed as query parameters. Ex: {a: 1, b: 2} becomes: ?a=1&b=2
* headers: ```Object``` any headers you might want to set. By default: {"content-type": "application/json", "accept": "application/json"} are always set, which can be overridden. 
* body: ```String|Object``` for POST|PUT requests.

#### loadBalancer
* strategy: ```String``` Possible values, Ex: "round-robin"
  1. round-robin: once each on the disovered instances
  2. random: at random
  3. disabled: load balancing will be disabled, the first instance returned by the discovery will always be used. This allows for server-side load balancing.


#### discovery
* serviceId: ```String``` name of the service to discover, Ex: "testservice"
* serverType: ```String``` Service discovery server to be used. Ex: "consul"
  1. consul: uses consul for service disovery
  2. direct: No service discovery, use ```instances``` property to set instances directly.
  3. eureka (coming soon)
* client: ```Object``` instance of discovery service client, if you already have one; you might have used it for registering your service.
* clientConfig: ```Object``` Configuration to be passed to discovery service client, if you want sarathi to instantiate it
* refreshRate: ```number``` in ms. timeout, to refresh discovered services. Ex: 30000 to mean every 30s.
* zone: ```String``` not yet supported, but for data-center awareness.
* instances: ```Array[String]``` urls pointing to base path of service instances. Ex: ["http://192.168.222.11:8080/testservice", "http://192.168.222.12:8080/testservice"]

#### restClient
* retry: ```number``` Number of times to retry when error occurs in a REST call. If load balancing is enabled, the load balancing strategy decides where the next call will go to. Total calls triggered in worst case will be 1 + retry.
* timeout: ```number``` in ms. Timeout for rest calls.


## Configuration
### Default configuration
```
{
	methods: {},
	loadBalancer: {
		strategy: "round-robin"
	},
	discovery: {
		serviceId: "",
		serverType: "consul",
		client: undefined,
		clientConfig: {},
		refreshRate: 30000,
		zone: undefined,
		instances: undefined
	},
	restClient: {
		retry: 2,
		timeout: 2000
	}
};
```

### Default method configuration
```
{
	"url": undefined,
	"httpMethod": "GET",
    "placeholders": {},
    "queryParams": {},
    "headers": {
		"content-type": "application/json",
		"accept": "application/json"
	},
    "body": undefined
}
```

### Example

```
{
	methods: { // methods to define on this client and their endpoints and other parameters
		getUsers: "/users",
		getUser: { url: "/users/{id}", "accept": "application/xml"}
	},
	loadBalancer: { // Load balancer config
		strategy: "round-robin" // random, disabled
	},
	discovery: { // Service discovery config
		serviceId: "test-service", // name of your service
		serverType: "consul", // direct, [eureka, coming]
		clientConfig: {}, // configuration to create disovery client instance: server ip, port etc
		refreshRate: 15000, // timeout to refresh services from discovery server
	},
	restClient: { // Rest client config
		retry: 2, // number of retries on failure before returning error; value 2 means: 1 + 2 = 3 max calls.
		timeout: 2000 // REST call timeout
	}
```

<a name="API"></a>
## API
A fluent API for setting all configurations

#### SarathiClientBuilder(options)
constructor, sets the options as passed. Options not mandatory.

##### SarathiClientBuilder# setConfig(options)
override anything set in constructor.

##### SarathiClientBuilder #addMethod(methodName, methodOptions OR url)
adds a single method to the client, with provided method options. If you are fine with defaults, just pass the url instead.

##### SarathiClientBuilder #setMethods(methods)
set all methods on client, with structure as {methodName: methodOptions}

##### SarathiClientBuilder #setRestClientConfig(restClientConfig)
set config for rest client.

##### SarathiClientBuilder #setRetryCount(retryCount)
set the retry count for rest client.

##### SarathiClientBuilder #setLoadBalanceStrategy(strategy)
set the strategy for load balancing

##### SarathiClientBuilder #getDiscoveryBuilder(serverType)
returns an instance of DiscoveryBuilder of type ```serverType```

##### SarathiClientBuilder #newMethodDefaults()
returns an object with default values of methodOptions

##### SarathiClientBuilder #build()
builds the configuration provided and returns the restClient.



#### DiscoveryBuilder()
Object returned by getDiscoveryBuilder method of SarathiClientBuilder

##### DiscoveryBuilder# setClient(discoveryClient)
set instance of the discovery server client. This shall come handy when you have already instantiated the client instance for registering with the server.

##### DiscoveryBuilder# setClientConfig(clientConfig)
pass the config for sarathi to instantiate the client

##### DiscoveryBuilder# setRefreshRate(refreshRate)
set service catalg refresh timeout

##### DiscoveryBuilder# setServiceId(serviceId)
set the service name to look for on the discovery server

##### DiscoveryBuilder# setDirectInstances(instances)
set the urls of the instances with direct paths pointing to base/context, for when service discovery is not being used.

##### DiscoveryBuilder# setZone(zone)
NOT Implemented; but this is where you can set the data center preference

##### DiscoveryBuilder# build()
builds the discovery handler instance and returns the instance of SarathiClientBuilder; helps chaining calls.


## Code Samples
#### Configuration
```
var SarathiClientBuilder = require("sarathi");
var clientBuilder = new SarathiClientBuilder();

var client = clientBuilder.setConfig({
		discovery: {
			serviceId: "express-service",
			serverType: "consul"
		},
		restClient: {
			retry: 2
		},
        loadBalancer: {
			strategy: "round-robin"
		}
    })
    .getDiscoveryBuilder("consul")
    	.setClientConfig({}) // for when consul is running on localhost:8500
    	.setRefreshRate(3000)
    .build()
    .addMethod("getUsers", "/users")
    .addMethod("getUser", { url: "/users/{id}", headers: {accept: "text/html" }})
    .build();
```

#### Simple invocation
```
client.getUsers(function(e, r, b) {
    console.log(b);
});
```

#### Resolving placeholders and passing custom headers
```
client.getUser({placeholders: { id: 4 }, headers: {someHeader: "value"}}, function(e, r, b) {
    console.log(b);
});
```

#### Passing Query parameters
```
client.getUsers({queryParams: {name: "nikhil"}}, function(e, r, b) {
    console.log(b);
});
```

#### Making a POST call with JSON body
```
client.getUsers({httpMethod: "POST", body: {v: "some body"}}, function(e, r, b) {
    console.log(b);
});
```

#### Making a POST call with String body
```
client.getUsers({httpMethod: "POST", body: '{"v": "some body"}' }, function(e, r, b) {
    console.log(b);
});
```
#### Gardening
```
Raise a github issue.
```

## Using Sarathi with hystrixjs
Coming soon.


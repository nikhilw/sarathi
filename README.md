# Sarathi

Service discovery aware declarative rest client with client side load balancing.

Sarathi is a rest client for microservices. It is modelled similar to probably the most popular rest client of this sort in Java world: Feign (spring-cloud-feign) and its load balancer: Ribbon (spring-cloud-ribbon), both from Netflix and fall under spring cloud project.

[![Build Status](https://travis-ci.org/nikhilw/sarathi.svg?branch=master)](https://travis-ci.org/nikhilw/sarathi) [![Coverage Status](https://coveralls.io/repos/github/nikhilw/sarathi/badge.svg?branch=master)](https://coveralls.io/github/nikhilw/sarathi?branch=master)

## Installing
```npm
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
```javascript
var SarathiClientBuilder = require("sarathi");
var testServiceClient = new SarathiClientBuilder().setConfig(options).build();
```

## Examples
#### Configuration
```javascript
var SarathiClientBuilder = require("sarathi");
var clientBuilder = new SarathiClientBuilder();

var client = clientBuilder.setConfig({
		restClient: {
			retry: 2
		},
        loadBalancer: {
			strategy: "round-robin"
		}
    })
    .setDiscoveryStrategy(new ConsulDiscoveryStrategy({serviceId: "express-service"}))
    .addMethod("getUsers", "/users")
    .addMethod("getUser", { url: "/users/{id}", headers: {accept: "text/html" }})
    .build();
```

#### Simple invocation
```javascript
client.getUsers(function(e, r, b) {
    console.log(b);
});
```

#### Resolving placeholders and passing custom headers
```javascript
client.getUser({placeholders: { id: 4 }, headers: {someHeader: "value"}}, function(e, r, b) {
    console.log(b);
});
```

#### Passing Query parameters
```javascript
client.getUsers({queryParams: {name: "nikhil"}}, function(e, r, b) {
    console.log(b);
});
```

#### Making a POST call with JSON body
```javascript
client.getUsers({httpMethod: "POST", body: {v: "some body"}}, function(e, r, b) {
    console.log(b);
});
```

#### Making a POST call with String body
```javascript
client.getUsers({httpMethod: "POST", body: '{"v": "some body"}' }, function(e, r, b) {
    console.log(b);
});
```
#### Gardening
```
Please return when you are sober ;)
```

#### Options
**NOTE: [API](#API) is much more fun**

* methods: ```Object``` declaring method name, endpoint they refer to, http method etc.
* loadBalancer: ```Object``` Load balancer configuration
* discoveryStrategy: ```Object``` Instance of service discovery strategy
* restClient: ```Object``` Rest client configuration

#### methods
Object of method description objects. Key of the object is your method name: Ex: getUsers

* url: ```String``` Corresponding http endpoint, can have placeholders. Ex: /users OR /users/{id}
* httpMethod: ```String``` HTTP method, Ex: "GET"
* placeholders: ```Object``` a map of values to resolve placeholders, should ideally be passed while invoking the method instead. Ex: {id: 1}
* queryParams: ```Object``` all attributes of this object are passed as query parameters. Ex: {a: 1, b: 2} becomes: ?a=1&b=2
* headers: ```Object``` any headers you might want to set. By default: {"content-type": "application/json", "accept": "application/json"} are always set, which can be overridden. 
* body: ```String|Object``` for POST/PUT requests.

#### loadBalancer
* strategy: ```String``` Possible values, Ex: "round-robin"
  1. round-robin: once each on the disovered instances
  2. random: at random
  3. disabled: load balancing will be disabled, the first instance returned by the discovery will always be used. This allows for server-side load balancing.


#### discovery
* discoveryStrategy: ```Object``` Instance of [sarathi-discovery-strategy](https://www.npmjs.com/package/sarathi-discovery-strategy), currently available implementations: [nodiscovery](https://www.npmjs.com/package/sarathi-nodiscovery-strategy) (when no discovery server), [consul.io](https://www.npmjs.com/package/sarathi-consul-strategy)


#### restClient
* retry: ```number``` Number of times to retry when error occurs in a REST call. If load balancing is enabled, the load balancing strategy decides where the next call will go to. Total calls triggered in worst case will be 1 + retry.
* timeout: ```number``` in ms. Timeout for rest calls.


## Configuration
### Default configuration
```javascript
{
	methods: {},
	loadBalancer: {
		strategy: "round-robin"
	},
	discoveryStrategy: undefined,
	restClient: {
		retry: 2,
		timeout: 2000
	}
}
```

### Default method configuration
```javascript
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

```javascript
{
	methods: { // methods to define on this client and their endpoints and other parameters
		getUsers: "/users",
		getUser: { url: "/users/{id}", "accept": "application/xml"}
	},
	loadBalancer: { // Load balancer config
		strategy: "round-robin" // random, disabled
	},
	discoveryStrategy: new ConsulDiscoveryStrategy({serviceId: "user-service"}),
	restClient: { // Rest client config
		retry: 2, // number of retries on failure before returning error; value 2 means: 1 + 2 = 3 max calls.
		timeout: 2000 // REST call timeout
	}
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

##### SarathiClientBuilder #setDiscoveryStrategy(```Object```)
Instance of [sarathi-discovery-strategy](https://www.npmjs.com/package/sarathi-discovery-strategy), currently available implementations: [nodiscovery](https://www.npmjs.com/package/sarathi-nodiscovery-strategy) (when no discovery server), [consul.io](https://www.npmjs.com/package/sarathi-consul-strategy)

##### SarathiClientBuilder #newMethodDefaults()
returns an object with default values of methodOptions

##### SarathiClientBuilder #build()
builds the configuration provided and returns the restClient.


## Using Sarathi with hystrixjs
Coming soon.


## Sarathi, the name
Pronounce it as /sa:raθiː/, it is a _noun_. It simply means: a charioteer. A sarathi controls the chariot, chooses the best route and navigates it. According to Hindu mythology, it also is an epithet of Krishna, an Avatar of Vishnu, who played the role of Arjun's charioteer, in the great war of Mahabharata and led him to victory.   

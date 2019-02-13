# Amp-Node Client

## Amp-Node Client Overview
The Amp-Node Client library has an Amp class. It can be used to construct an Amp instance used to represent a single Amp project and needs to be initialized with a project key and a list of domain, which is the URL of the Amp Agent. 

>_**Note: Contact support@scaledinference.com for more information on integrating with our Amp-Agent.  Amp-Agent is required to run the Amp-Node client.**_

## Installing Amp-Node Client
``` javascript
npm i --save amp-node
```
The single Amp instance can then be used to create multiple session objects which has three methods: decideWithContext, decide and observe.
## Amp()
After importing amp-node, the Amp constructor can be used to create an Amp instance. It requires two parameters: a project key and the Amp-agent URL (with port 8100) where as timeOutMilliseconds default to 10 seconds, sessionLifetimeInSeconds default to 30 minutes.

### Importing and Initializing Amp
``` javascript
const Amp = require("amp-node");
...
const amp = new Amp("YOUR_PROJECT_KEY", ["List of AMP_AGENT_URL"], timeoutInMilliseconds, sessionLifetimeInSeconds, dontUseTokens);
```

## amp.Session()
The session constructor is used to create a session (object):
### Initializing the Session
``` javascript
const session = new amp.Session();
```
Session objects created by an Amp instance support three methods: `decideWithContext`, `decide` and `observe`.


### session.decideWithContext()
The decideWithContext method is synchronous and used to make decision for the provided context and properties.
This method takes five arguments: name of the context event name, a property object of names to values for the context, name of the decision event, a list of variations to choose from and an override to the default timeout which needs to non-zero value in order to take effect. 

``` javascript
/**
 *  Decision to determine action for the provided context name and properties
 *
 * @param {string} contextName - name of the context event name
 * @param {object} context - properties to observe
 * @param {string} decisionName - name of the event
 * @param {object} candidates - variations to choose from
 * @param {int} timeout - request timeout in milliseconds will override the value from session or amp. Needs to be non-zero value in order to take effect. 
 *
 * @example
 * const context = { browser_height: 1740, browser_width : 360 };
 * const candidates = {color:['red', 'green', 'blue'], count:[10, 100]};
 *
 * session.decideWithContext(
 *         'AmpSession', context,
 *         'NodeDecisionWithContext', candidates, 3000
 *         );
 *
 */
 Promise<decideResponse> decideWithContext(contextName, context={}, decisionName, candidates,timeout)
```

## session.observe()

The observe method is used to send observations.

``` javascript
/**
 * observe, send observation with event name and properties related to 
 * observation 
 *
 * @param {string} contextName - name of the context
 * @param {object} context - properties to observe
 * @param {int} timeout - request timeout in milliseconds will override the value from session or amp
 * @return {Promise<observeResponse>}
 *
 * @example
 * 
 * session.observe('NodeObserveMetric',context);
 * 
 */
Promise<observeResponse> observe(contextName, context, timeout)
```

## Example Usage

>`node ./examples/example.js <project_key> http://localhost:8100`

``` javascript
console.log(`
This will demonstrate how to use the node thin client to communicate with amp agent. Make sure you pass in a valid project key and your domain to your amp agent, if you use a different apiPath, make sure you pass that too.
`);

// import the Amp library
const Amp = require("../Amp");

// parse the arguments from command line
// node example.js <key> <domain> <apiPath>
const projectKey = process.argv[2]; 
const ampAgents = process.argv.slice(3);

// create an amp instance with the key, domain, apiPath
const amp = new Amp(projectKey, ampAgents);

console.log(`
amp instance initialized
`);

// create a session instance
// can also specify the `userId`, `timeout` here: {userId: "guestUser"}
const session = new amp.Session();

console.log(`
session instance initliazed
`);

// send decideWithContext
const context = { browser_height: 1740, browser_width : 360 };
const candidates = {color:['red', 'green', 'blue'], count:[10, 100]};

const response = await session.decideWithContext(
  'AmpSession', context, 'NodeDecisionWithContext', candidates, 3000
);

if(response.fallback){
  console.log('Decision NOT successfully obtained from amp-agent. Using a fallback instead.');
  console.log(`The reason is: ${response.failureReason}`);
}else{
  console.log('Decision successfully obtained from amp-agent');
}

// send observe
const observeResponse = await session.observe('NodeObserveMetric',context);
if(!observeResponse.success){
  console.log('Observe NOT successfully sent to amp-agent.');// eslint-disable-line no-console
  console.log(`The reason is: ${observeResponse.failureReason}`);// eslint-disable-line no-console
}else{
  console.log('Observe successfully sent to amp-agent.');// eslint-disable-line no-console
}
```

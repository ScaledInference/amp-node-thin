# Amp-Node Client

## Amp-Node Client Overview
The Amp-Node Client library has an Amp class. It can be used to construct an Amp instance used to represent a single Amp project and needs to be initialized with a project key and the domain, which is the URL of the Amp Agent. 

>_**Note: Contact support@scaledinference.com for more information on integrating with our Amp-Agent.  Amp-Agent is required to run the Amp-Node client.**_

## Installing Amp-Node Client
``` javascript
npm i --save amp-node
```
The Amp instance can then be used to create session objects which have two main methods: observe and decide.
## Amp()
After importing amp-node, the Amp constructor can be used to create an Amp instance. It requires two parameters: a project key and the Amp-agent URL (with port 8100).

### Importing and Intializing Amp
``` javascript
const Amp = require("amp-node");
...
const amp = new Amp({key: "YOUR_PROJECT_KEY", domain: "AMP_AGENT_URL"});
```

## amp.Session()
The session constructor is used to create a session (object):
### Initializing the Session
``` javascript
const session = new amp.Session();
```
Session objects created by an Amp instance support two methods: `observe` and `decide`.

## session.Observe()

The observe method is used to send observations.

``` javascript
/**
 * observe, send observation with event name and properties related to 
 * observation 
 *
 * @name     observe
 * @memberOf session
 * @param    {String} name - required
 * @param    {Object} properties - optional
 * @param    {Object} options - optional
 * @param    {Number} options.timeout - time allowed to make request
 * @callback callback - optional
 * @param    {Error} err
 *
 * @example
 * session.observe(“userInfo”, {country: “china”, lang: “zh”}, 
 *   {timeout: 500}, function(err) {
 *     if(err) {
 *       console.log(err);
 *     }
 *  });
 * 
 */
void observe(name, properties, options, callback(err))
```

### session.Decide()
The decide method is used to make decisions. 

``` javascript
/**
 * decide, request a decision / several decisions using a named event and 
 * a list of candidates
 *
 * @name decide
 * @memberOf session
 * @param {String} name - required
 * @param {Object|Array} candidates - required
 * @param {Object} options - optional
 * @param {Number} options.timeout - the time in milliseconds that the
 *        request has to complete
 * @callback callback - optional
 * @param {Error} err
 * @param {Array} decisions
 *
 * @example
 * session.decide(“textStyle”, [
 *   {color: “red”, font: “bold”},
 *   {color: “green”, font: “italic”}, 
 *   {color: “blue”, font: “regular”},
 * ], function(err, decision) {
 *      // decision: the best candidate (from array of candidates)
 *      // use decision.color & decision.font to render to page
 * });
 * 
 */
void decide(name, candidates, options, callback(err, decision))
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
const domain = process.argv[3];
const apiPath = process.argv[4];

// create an amp instance with the key, domain, apiPath
const amp = new Amp({key: projectKey, domain: domain, apiPath: apiPath});

console.log(`
amp instance initialized
`);

// create a session instance
// can also specify the `userId`, `timeout` here: {userId: "guestUser"}
const session = new amp.Session();

console.log(`
session instance initliazed
`);

// send observe with user information
session.observe("userInfo", {lang: "en", country: "USA"}, function(err) {
  console.log(`
UserInfo Observe request sent! ${err ? "Error: " + err : " "}
  `);
});

// send decide on which color / font template you want to use
session.decide("Template", [
  {color: "red", font: "bold"},
  {color: "green", font: "italic"},
  {color: "red", font: "italic"},
  {color: "green", font: "bold"}
], function(err, decision) {
  // now use the decision
  // decision.color
  // decision.font
  console.log(`
Template Decide request sent! ${err ? "Error: " + err : " "} decide: ${JSON.stringify(decision)}
  `);
});

// you can also send with combinations
session.decide("TemplateCombo", {
  color: ["red", "green"],
  font: ["bold", "italic"]
}, function(err, decision) {
  // now use the decision
  // decision.color
  // decision.font
  console.log(`
Template Decide request sent! ${err ? "Error: " + err : " "} decide: ${JSON.stringify(decision)}
  `);
});

// if you want to limit the number of candidates returned, pass a `limit` into the options
session.decide("TemplateCombo", {
  color: ["red", "green"],
  font: ["bold", "italic"]
}, {
  limit: 2
}, function(err, decision) {
  // now use the decision
  // decision.color
  // decision.font
  console.log(`
Template Decide request sent! ${err ? "Error: " + err : " "} decide: ${JSON.stringify(decision)}
  `);
});


// send another observe to observe user interaction to help improve decide
// so we will build the model to help you make better decision on which template should be the best choice for which type of users and will give you the highest or lowest click on `SignUp`
session.observe("ClickBtn", {btnName: "SignUp"}, function(err) {
  console.log(`
ClickBtn Observe request sent! ${err ? "Error: " + err : " "}
  `);
});
```

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
], function(err, decisions) {
  // now use the decision
  // decisions.color
  // decisions.font
  console.log(`
Template Decide request sent! ${err ? "Error: " + err : " "} decide: ${JSON.stringify(decisions)}
  `);
});

// you can also send with combinations
session.decide("TemplateCombo", {
  color: ["red", "green"],
  font: ["bold", "italic"]
}, function(err, decisions) {
  // now use the decision
  // decision.color
  // decision.font
  console.log(`
Template Combo Decide request sent! ${err ? "Error: " + err : " "} decide: ${JSON.stringify(decisions)}
  `);
});


// send another observe to observe user interaction to help improve decide
// so we will build the model to help you make better decision on which template should be the best choice for which type of users and will give you the highest or lowest click on `SignUp`
session.observe("ClickBtn", {btnName: "SignUp"}, function(err) {
  console.log(`
ClickBtn Observe request sent! ${err ? "Error: " + err : " "}
  `);
});


// load test
let count = 0;
let errCount = 0;
const interval = setInterval(function() {
  session.observe("ClickBtn", {btnName: "SignUp"}, function(err) {
    if (!err) { 
      count++; 
    } else  {
      errCount++;
    }

    console.log(`
  ClickBtn Observe request sent!  sent: ${count} errors: ${errCount} ${err ? "Error: " + err : " "}
    `);
  });
}, 1);

setTimeout(function() {
  clearInterval(interval);
}, 1000);


// for (let i = 0; i < 500; i++) {
//   const session = new amp.Session();
//   session.observe("ClickBtn", {btnName: "SignUp"}, function(err) {
//     console.log(`
//   ClickBtn Observe request sent! ${err ? "Error: " + err : " "}
//     `);
//   });  
// }

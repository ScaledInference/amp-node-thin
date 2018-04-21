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

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function demo() {
    await sleep(1000);
    // if you need to get all of the potential decisions because the context was not available and want to use that decision when it become available, you can use the conditional decide method
    // by sending us the event and context you want decisions on along with your decision event name and candidates
    session.decideCond('ConditionalDecide', {
        color: ['red', 'green'],
        font: ['bold', 'italic']
    }, 'Locale', {en: {showModal: true}, es: {showModal: false}}, function (err, decision) {
        if (err) {
            console.log('ConditionalDecide conditional decision not sent!', err.message);
        } else {
            console.log('ConditionalDecide conditional decide sent!  Response was: ', decision);
        }
    });
    await sleep(1000);
    session.observe('Locale', {showModal: true}, function (err) {
        if (err) {
            console.log('Locale Observe not sent!', err.message);
        } else {
            console.log('Locale Observe request sent!');
        }
    });
}

// send another observe to observe user interaction to help improve decide
// so we will build the model to help you make better decision on which template should be the best choice for which type of users and will give you the highest or lowest click on `SignUp`
session.observe("ClickBtn", {btnName: "SignUp"}, function(err) {
  console.log(`
ClickBtn Observe request sent! ${err ? "Error: " + err : " "}
  `);
});
